import { jest } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";

interface ExecutionResult {
  logs: any[][];
}

export async function compareFixtureLogs(fixturePath: string): Promise<void> {
  const logs: any[][] = [];
  const logSpy = jest.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args);
  });

  try {
    // Execute both files and compare their logs
    const codeResults = await executeFile(
      path.join(fixturePath, "code.js"),
      logs,
    );
    logs.length = 0; // Clear logs for output file
    const outputResults = await executeFile(
      path.join(fixturePath, "output.js"),
      logs,
    );

    expect(outputResults.logs).toEqual(codeResults.logs);
  } finally {
    logSpy.mockRestore();
  }
}

async function executeFile(
  filePath: string,
  logs: any[][],
): Promise<ExecutionResult> {
  const code = fs.readFileSync(filePath, "utf8");

  const context = vm.createContext({
    console: {
      log: (...args: any[]) => logs.push(args),
    },
    setTimeout,
    clearTimeout,
    global,
  });

  const script = new vm.Script(code);
  script.runInContext(context, { timeout: 2000 });

  return { logs: [...logs] };
}
