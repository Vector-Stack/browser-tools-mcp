#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const path_1 = __importDefault(require("path"));
// import fs from "fs";
// Create the MCP server
const server = new mcp_js_1.McpServer({
    name: "AI Browser Connector",
    version: "1.0.0",
});
// Function to get the port from the .port file
// function getPort(): number {
//   try {
//     const port = parseInt(fs.readFileSync(".port", "utf8"));
//     return port;
//   } catch (err) {
//     console.error("Could not read port file, defaulting to 3000");
//     return 3025;
//   }
// }
// const PORT = getPort();
const PORT = 3025;
// We'll define four "tools" that retrieve data from the aggregator at localhost:3000
server.tool("getConsoleLogs", "Check our browser logs", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/console-logs`);
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(json, null, 2),
            },
        ],
    };
});
server.tool("getConsoleErrors", "Check our browsers console errors", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/console-errors`);
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(json, null, 2),
            },
        ],
    };
});
// Return all HTTP errors (4xx/5xx)
server.tool("getNetworkErrors", "Check our network ERROR logs", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/network-errors`);
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(json, null, 2),
            },
        ],
    };
});
// // Return all XHR/fetch requests
// server.tool("getNetworkSuccess", "Check our network SUCCESS logs", async () => {
//   const response = await fetch(`http://127.0.0.1:${PORT}/all-xhr`);
//   const json = await response.json();
//   return {
//     content: [
//       {
//         type: "text",
//         text: JSON.stringify(json, null, 2),
//       },
//     ],
//   };
// });
// Return all XHR/fetch requests
server.tool("getNetworkLogs", "Check ALL our network logs", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/all-xhr`);
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(json, null, 2),
            },
        ],
    };
});
// Add new tool for taking screenshots
server.tool("takeScreenshot", "Take a screenshot of the current browser tab", async () => {
    try {
        const response = await fetch(`http://127.0.0.1:${PORT}/screenshot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await response.json();
        if (response.ok) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Screenshot saved to: ${result.path}\nFilename: ${path_1.default.basename(result.path)}`,
                    },
                ],
            };
        }
        else {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error taking screenshot: ${result.error}`,
                    },
                ],
            };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to take screenshot: ${errorMessage}`,
                },
            ],
        };
    }
});
// Add new tool for getting selected element
server.tool("getSelectedElement", "Get the selected element from the browser", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/selected-element`);
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(json, null, 2),
            },
        ],
    };
});
// Add new tool for wiping logs
server.tool("wipeLogs", "Wipe all browser logs from memory", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/wipelogs`, {
        method: "POST",
    });
    const json = await response.json();
    return {
        content: [
            {
                type: "text",
                text: json.message,
            },
        ],
    };
});
// Start receiving messages on stdio
(async () => {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
})();
