import { CopyInstruction } from '../../../../ir/instructions/memory/CopyInstruction.js';
import { LoadDynamicPropertyInstruction } from '../../../../ir/instructions/memory/LoadDynamicProperty.js';
import { LoadGlobalInstruction } from '../../../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../../../ir/instructions/memory/LoadLocal.js';
import { LoadPhiInstruction } from '../../../../ir/instructions/memory/LoadPhi.js';
import { LoadStaticPropertyInstruction } from '../../../../ir/instructions/memory/LoadStaticProperty.js';
import { StoreLocalInstruction } from '../../../../ir/instructions/memory/StoreLocal.js';
import 'lodash-es';
import { StoreDynamicPropertyInstruction } from '../../../../ir/instructions/memory/StoreDynamicProperty.js';
import { StoreStaticPropertyInstruction } from '../../../../ir/instructions/memory/StoreStaticProperty.js';
import { generateCopyInstruction } from './generateCopy.js';
import { generateLoadDynamicPropertyInstruction } from './generateLoadDynamicProperty.js';
import { generateLoadGlobalInstruction } from './generateLoadGlobal.js';
import { generateLoadLocalInstruction } from './generateLoadLocal.js';
import { generateLoadPhiInstruction } from './generateLoadPhi.js';
import { generateLoadStaticPropertyInstruction } from './generateLoadStaticProperty.js';
import { generateStoreDynamicPropertyInstruction } from './generateStoreDynamicProperty.js';
import { generateStoreLocalInstruction } from './generateStoreLocal.js';
import { generateStoreStaticPropertyInstruction } from './generateStoreStaticProperty.js';

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
    else if (instruction instanceof LoadStaticPropertyInstruction) {
        return generateLoadStaticPropertyInstruction(instruction, generator);
    }
    else if (instruction instanceof LoadDynamicPropertyInstruction) {
        return generateLoadDynamicPropertyInstruction(instruction, generator);
    }
    else if (instruction instanceof StoreLocalInstruction) {
        return generateStoreLocalInstruction(instruction, generator);
    }
    else if (instruction instanceof StoreStaticPropertyInstruction) {
        return generateStoreStaticPropertyInstruction(instruction, generator);
    }
    else if (instruction instanceof StoreDynamicPropertyInstruction) {
        return generateStoreDynamicPropertyInstruction(instruction, generator);
    }
    throw new Error(`Unsupported memory instruction: ${instruction.constructor.name}`);
}

export { generateMemoryInstruction };
//# sourceMappingURL=generateMemory.js.map
