import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_CRITICAL,
  defineExtension,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from "lexical";

export const DisableDragDropExtension = defineExtension({
  name: "DisableDragDrop",

  register: (editor) =>
    mergeRegister(
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          event.preventDefault();

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          event.preventDefault();

          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "none";
          }

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    ),
});
