CAUGHT BUGS:
- in anthropic tool use, somehow it made up a new parameter it outpu
- i got this error saying
"  "tool_choice": {
    "type": "tool",
    "name": "use_terminal"
  }
}
Error in AI system loop: 100 |       // Active period
101 |       while (actionCount < MAX_ACTIONS) {
102 |         const functionResult = await terminalAgent.run();
103 | 
104 |         if (!functionResult.success) {
105 |           throw new Error(functionResult.error);
                      ^
error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"Your API request included an `assistant` message in the final position, which would pre-fill the `assistant` response. When using tools, pre-filling the `assistant` response is not supported."}}
      at /Users/saint/Dev/agent-x/src/index.ts:105:17"

in a terminal run, after it did several back to back function calls perfectly fine

- another bug where it seems like anthropic didnt use the tool call properly which ended in this output:
🤖 Processed Function Call: {
  functionName: "use_terminal",
  functionArgs: {},
}

📝 Formatted Response: ## USED TOOL: use_terminal

Error in AI system loop: 100 |       // Active period
101 |       while (actionCount < MAX_ACTIONS) {
102 |         const functionResult = await terminalAgent.run();
103 | 
104 |         if (!functionResult.success) {
105 |           throw new Error(functionResult.error);
                      ^
error: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "internal_thought"
    ],
    "message": "Required"
  },
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "plan"
    ],
    "message": "Required"
  },
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "terminal_command"
    ],
    "message": "Required"
  }
]
      at /Users/saint/Dev/agent-x/src/index.ts:105:17

🛠️ Terminal Tools Defined: [ "use_terminal" ]