type SearchParamsLike =
  | Record<string, string | string[] | undefined>
  | undefined;

const loginFeedback: Record<string, string> = {
  invalid_credentials: "邮箱或密码不正确。",
  missing_fields: "请填写邮箱和密码。",
  unknown_error: "登录失败，请稍后再试。",
};

const registerFeedback: Record<string, string> = {
  duplicate_email: "该邮箱已被使用，请直接登录或更换邮箱。",
  invalid_email: "请输入有效邮箱地址。",
  weak_password: "密码至少需要 8 位字符。",
  missing_fields: "请完整填写邮箱、密码和主身份。",
  unknown_error: "注册失败，请稍后再试。",
};

function resolveErrorValue(searchParams: SearchParamsLike) {
  if (!searchParams) {
    return undefined;
  }

  const value = searchParams.error;

  return Array.isArray(value) ? value[0] : value;
}

export function getAuthStatusMessage(
  mode: "login" | "register",
  searchParams: SearchParamsLike,
) {
  const error = resolveErrorValue(searchParams);

  if (!error) {
    return null;
  }

  const feedbackMap = mode === "login" ? loginFeedback : registerFeedback;

  return feedbackMap[error] ?? feedbackMap.unknown_error;
}
