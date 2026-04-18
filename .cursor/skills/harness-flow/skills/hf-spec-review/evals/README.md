# hf-spec-review evals

## Protected Behavior Contracts

These evals protect the following behavioral contracts of `hf-spec-review`:

1. **Fuzzy word detection**: Identifies unquantified quality adjectives in acceptance criteria and requires measurable replacements
2. **Design leakage detection**: Identifies implementation details (tech stack, API names, message queues) that should not appear in specs
3. **Negative path coverage**: Identifies specs that only describe happy paths without failure, boundary, or permission scenarios
4. **Composite requirement detection**: Identifies FRs that pack multiple independent capabilities
5. **Precheck behavior**: Correctly refuses to enter review when no stable spec draft exists, and reroutes appropriately
6. **Finding classification**: Correctly distinguishes USER-INPUT from LLM-FIXABLE findings
7. **Goal / success criteria review**: Detects specs that have requirements but still lack concrete success criteria
8. **Assumption visibility review**: Detects hidden critical assumptions that are not explicitly documented with failure impact
9. **Verdict correctness**: Returns correct verdict (pass/revise/blocked) based on finding severity and coverage

## Structure

- `evals.json`: test cases covering normal paths, boundary conditions, and typical failure modes

## Running

Each eval provides a `prompt` simulating a user request and `expectations` describing the required behavior. Evaluate by checking whether the skill's output satisfies all listed expectations.
