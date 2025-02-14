// @flow
import { getObjectParameterIndex } from './EnumerateInstructions';
const gd: libGDevelop = global.gd;

/**
 * After selecting an instruction, this function allows to set up the proper
 * number of parameters, set up the object name (if an object instruction was chosen)
 * and set up the behavior name (if a behavior instruction was chosen).
 */
export const setupInstructionParameters = (
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  instruction: gdInstruction,
  instructionMetadata: gdInstructionMetadata,
  objectName: ?string
) => {
  instruction.setParametersCount(instructionMetadata.getParametersCount());

  // For free instructions (not linked to an object or behavior), we can stop there.
  // In the future, we could set up default values for parameters.
  if (!objectName) return;

  // Set the object name.
  const objectParameterIndex = getObjectParameterIndex(instructionMetadata);
  if (objectParameterIndex === -1) {
    console.error(
      `Instruction "${instructionMetadata.getFullName()}" is used for an object, but does not have an object as first parameter`
    );
    return;
  }

  instruction.setParameter(objectParameterIndex, objectName);

  // Set the behavior name, if any.
  const maybeBehaviorParameterIndex = objectParameterIndex + 1;
  if (maybeBehaviorParameterIndex < instructionMetadata.getParametersCount()) {
    const maybeBehaviorParameterMetadata = instructionMetadata.getParameter(
      maybeBehaviorParameterIndex
    );
    if (
      !gd.ParameterMetadata.isBehavior(maybeBehaviorParameterMetadata.getType())
    ) {
      // The parameter after the object is not a behavior, there is nothing to complete.
      return;
    }

    const allowedBehaviorType = maybeBehaviorParameterMetadata.getExtraInfo();
    const behaviorNames = gd
      .getBehaviorsOfObject(
        globalObjectsContainer,
        objectsContainer,
        objectName,
        true
      )
      .toJSArray()
      .filter(behaviorName => {
        return (
          !allowedBehaviorType ||
          gd.getTypeOfBehavior(
            globalObjectsContainer,
            objectsContainer,
            behaviorName,
            false
          ) === allowedBehaviorType
        );
      });

    if (behaviorNames.length > 0) {
      const currentParameterValue = instruction
        .getParameter(maybeBehaviorParameterIndex)
        .getPlainString();

      // Set the behavior to the first matching behavior, in case a matching behavior name
      // is not already set.
      if (
        !behaviorNames.some(
          behaviorName => currentParameterValue === behaviorName
        )
      ) {
        instruction.setParameter(maybeBehaviorParameterIndex, behaviorNames[0]);
      }
    } else {
      // Ignore - this will be shown as an error in the BehaviorField (the required
      // behavior is not attached to the object).
    }
  }
};
