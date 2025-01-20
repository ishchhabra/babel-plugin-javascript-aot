import { CopyInstruction } from '../../../../ir/instructions/memory/CopyInstruction.js';
import { LoadGlobalInstruction } from '../../../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../../../ir/instructions/memory/LoadLocal.js';
import { LoadPhiInstruction } from '../../../../ir/instructions/memory/LoadPhi.js';
import { StoreLocalInstruction } from '../../../../ir/instructions/memory/StoreLocal.js';
import 'lodash-es';
import { generateCopyInstruction } from './generateCopy.js';
import { generateLoadGlobalInstruction } from './generateLoadGlobal.js';
import { generateLoadLocalInstruction } from './generateLoadLocal.js';
import { generateLoadPhiInstruction } from './generateLoadPhi.js';
import { generateStoreLocalInstruction } from './generateStoreLocal.js';

function generateMemoryInstruction(instruction, generator) {
    if (instruction instanceof CopyInstruction) {
        return generateCopyInstruction(instruction, generator);
    }
    else if (instruction instanceof LoadGlobalInstruction) {
        return generateLoadGlobalInstruction(instruction, generator);
    }
    else if (instruction instanceof LoadLocalInstruction) {
        return generateLoadLocalInstruction(instruction, generator);
    }
    else if (instruction instanceof LoadPhiInstruction) {
        return generateLoadPhiInstruction(instruction, generator);
    }
    else if (instruction instanceof StoreLocalInstruction) {
        return generateStoreLocalInstruction(instruction, generator);
    }
    throw new Error(`Unsupported memory instruction: ${instruction.constructor.name}`);
}

export { generateMemoryInstruction };
//# sourceMappingURL=generateMemory.js.map
