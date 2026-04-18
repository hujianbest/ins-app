# C++ 测试反模式

**何时加载此参考：** 编写或修改测试、添加 mock、或者想给产品类加只有测试才用的方法时。

## 概述

测试必须验证真实行为，不是 mock 的行为。Mock 是隔离手段，不是被测对象。

**核心原则：** 测代码做了什么，不测 mock 做了什么。

**严格执行 TDD 可以预防以下所有反模式。**

## 铁律

```
1. 绝不测试 mock 的行为
2. 绝不给产品类加测试专用方法
3. 绝不在不了解依赖的情况下 mock
```

## 反模式 1：测试 Mock 的行为

**错误做法：**
```cpp
// ❌ 验证的是 mock 存在，不是组件行为
TEST_F(EngineTest, HasLogger) {
  EXPECT_NE(engine_->get_logger(), nullptr);
  // get_logger() 返回的是你注入的 MockLogger...这证明了什么？
}
```

**为什么有问题：**
- 你在验证 mock 是否被正确设置，不是产品代码是否正确
- mock 在就通过、mock 不在就失败——和真实行为无关
- 对你理解系统行为毫无帮助

**修复：**
```cpp
// ✅ 测试真实行为：当出错时，日志被记录
TEST_F(EngineTest, LogsErrorOnInvalidInput) {
  EXPECT_CALL(*mock_logger_, log(HasSubstr("invalid")));
  engine_->process("###invalid###");
}
```

### 检查步骤

```
在对 mock 元素做断言之前：
  问自己："我测的是真实行为还是 mock 的存在？"

  如果是 mock 的存在：
    停下——删掉这个断言，或者不要 mock 这个组件

  测试真实行为。
```

## 反模式 2：给产品类加测试专用方法

**错误做法：**
```cpp
// ❌ reset_for_testing() 只在测试中使用
class ConnectionPool {
public:
  Connection& acquire();
  void release(Connection& conn);
  void reset_for_testing() {   // 生产代码里不该出现这个
    connections_.clear();
    active_count_ = 0;
  }
private:
  std::vector<Connection> connections_;
  int active_count_ = 0;
};

// 测试中
TEST(PoolTest, ...) {
  // ...
  pool.reset_for_testing();  // 如果生产代码误调用呢？
}
```

**为什么有问题：**
- 产品类被测试关注点污染
- 如果生产代码意外调用，后果严重
- 违反 YAGNI 和职责分离
- 对象生命周期与实体生命周期混淆

**修复：**
```cpp
// ✅ 测试清理逻辑放在测试工具中
// ConnectionPool 没有 reset 方法——生产中它由构造/析构管理

// test_helpers.h
inline void drain_pool(ConnectionPool& pool) {
  // 通过公开 API 将连接全部 release
}

// 测试中：每个 test 直接构造新 pool（RAII）
class PoolTest : public ::testing::Test {
protected:
  void SetUp() override {
    pool = std::make_unique<ConnectionPool>(config);
  }
  std::unique_ptr<ConnectionPool> pool;
};
```

### 检查步骤

```
在给产品类加方法之前：
  问自己："这个方法只有测试会用吗？"

  如果是：
    停下——不要加
    放到测试工具里

  问自己："这个类拥有这个资源的生命周期吗？"

  如果不拥有：
    停下——这个方法不该在这个类里
```

## 反模式 3：不了解依赖就 Mock

**错误做法：**
```cpp
// ❌ Mock 阻断了测试依赖的副作用
TEST(ConfigTest, DetectsDuplicateEntry) {
  // Mock 掉了 FileWriter，但测试需要文件实际被写入来检测重复！
  auto mock_writer = std::make_shared<MockFileWriter>();
  EXPECT_CALL(*mock_writer, write(_, _)).WillRepeatedly(Return(true));

  ConfigManager mgr(mock_writer);
  mgr.add_entry("key1", "value1");
  EXPECT_THROW(mgr.add_entry("key1", "value2"), DuplicateKeyError);
  // 如果 add_entry 内部靠读文件检测重复，mock 写入意味着文件为空——永远不会报重复
}
```

**为什么有问题：**
- 被 mock 的方法有测试依赖的副作用（写入配置文件）
- 为了"安全"过度 mock，破坏了真实行为链
- 测试因为错误的原因通过或失败

**修复：**
```cpp
// ✅ 在正确的层级 mock
TEST(ConfigTest, DetectsDuplicateEntry) {
  // 用内存中的 StringWriter 代替文件 I/O，但保留写入行为
  auto mem_writer = std::make_shared<InMemoryWriter>();
  ConfigManager mgr(mem_writer);

  mgr.add_entry("key1", "value1");  // 写入内存
  EXPECT_THROW(mgr.add_entry("key1", "value2"), DuplicateKeyError);  // 读到重复 ✓
}
```

### 检查步骤

```
在 mock 任何方法之前：
  停下——先不要 mock

  1. 问："真实方法有哪些副作用？"
  2. 问："测试是否依赖这些副作用？"
  3. 问："我真的理解测试需要什么吗？"

  如果依赖副作用：
    在更底层 mock（真正慢或外部的操作）
    或用保留必要行为的 test double
    不要 mock 测试依赖的高层方法

  如果不确定测试需要什么：
    先用真实实现跑一遍测试
    观察实际需要发生什么
    然后在正确的层级加最少的 mock

  警告信号：
    - "mock 掉比较安全"
    - "可能比较慢，先 mock 吧"
    - 不了解依赖链就 mock
```

## 反模式 4：不完整的 Mock 数据

**错误做法：**
```cpp
// ❌ 只构造了你以为需要的字段
HttpResponse mock_response{
  .status_code = 200,
  .body = R"({"user_id": "123", "name": "Alice"})"
  // 缺少：headers、content_type——下游代码可能依赖它们
};
```

**为什么有问题：**
- 部分 mock 隐藏了结构假设
- 下游代码可能访问你没提供的字段——静默失败或 UB
- 测试通过但集成失败
- 虚假的安全感

**修复：**
```cpp
// ✅ 镜像真实 API 的完整结构
HttpResponse mock_response{
  .status_code = 200,
  .headers = {{"Content-Type", "application/json"}},
  .body = R"({"user_id": "123", "name": "Alice", "metadata": {"request_id": "req-789"}})"
};
```

### 检查步骤

```
在构造 mock 数据之前：
  检查："真实 API 返回的完整结构是什么？"

  操作：
    1. 查看实际 API 文档/示例
    2. 包含下游可能消费的所有字段
    3. 确认 mock 与真实响应 schema 完全匹配

  关键：
    如果你在构造 mock，你必须理解完整结构
    部分 mock 在代码依赖被省略字段时静默失败

  不确定时：包含文档中列出的所有字段
```

## 反模式 5：GoogleMock 过度使用

**错误做法：**
```cpp
// ❌ 能直接用的类也要 mock
class Calculator { /* 纯计算，无外部依赖 */ };

class MockCalculator : public Calculator {
public:
  MOCK_METHOD(int, add, (int, int), (override));
};

TEST(BillingTest, CalculatesTotal) {
  MockCalculator calc;
  EXPECT_CALL(calc, add(100, 50)).WillOnce(Return(150));
  // ...你在测 mock 的加法，不是真实的加法
}
```

**为什么有问题：**
- Calculator 没有外部依赖，不需要隔离
- Mock 让测试更脆弱、更复杂，且什么都没证明
- 如果 Calculator::add 有 bug，这个测试发现不了

**修复：**
```cpp
// ✅ 直接使用真实对象
TEST(BillingTest, CalculatesTotal) {
  Calculator calc;  // 真实对象，无 mock
  Billing billing(calc);
  EXPECT_EQ(billing.total(100, 50), 150);
}
```

**何时该用 GoogleMock：**
- 网络调用、文件系统、数据库、外部服务
- 非确定性行为（时间、随机数）
- 构造成本极高的对象

**何时不该用：**
- 纯计算类
- 值对象
- 内存中的数据结构

## Mock 变得太复杂时

**警告信号：**
- mock setup 比测试逻辑还长
- 为了让测试通过要 mock 所有东西
- mock 缺少真实组件的方法
- 修改 mock 就破坏测试

**考虑：** 用真实组件的集成测试通常比复杂的 mock 更简单。

## TDD 如何预防这些反模式

1. **先写测试** → 迫使你思考到底在测什么
2. **看着失败** → 确认测的是真实行为不是 mock
3. **最少实现** → 测试专用方法不会悄悄混入
4. **真实依赖** → 在 mock 之前你已经知道测试实际需要什么

**如果你在测试 mock 的行为，你违反了 TDD** ——你在没看到测试对真实代码失败之前就加了 mock。

## 速查表

| 反模式 | 修复 |
|--------|------|
| 对 mock 元素做断言 | 测真实组件或不要 mock |
| 产品类里加测试专用方法 | 移到测试工具 |
| 不了解依赖就 mock | 先理解依赖，最小化 mock |
| 不完整的 mock 数据 | 镜像真实 API 完整结构 |
| 测试是事后补的 | TDD——先写测试 |
| 过度复杂的 mock | 考虑集成测试 |
| 能直接用的类也 mock | 用真实对象 |

## 红灯信号

- 断言中出现 `mock_` 前缀的对象属性验证
- 方法只在测试文件中被调用
- mock setup 占测试代码 >50%
- 删掉 mock 测试就挂了
- 说不清为什么需要 mock
- "mock 掉比较安全"

## 底线

**Mock 是隔离的工具，不是被测的对象。**

如果 TDD 过程中发现你在测 mock 的行为，说明方向错了。

修复：测真实行为，或者反思为什么要 mock。
