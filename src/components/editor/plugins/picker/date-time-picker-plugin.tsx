import { CalendarIcon } from "lucide-react";
import { ComponentPickerOption } from "@/components/component-picker-option";
import { INSERT_DATETIME_COMMAND } from "@/components/editor/extensions/date-time-extension";

export function DateTimePickerPlugin() {
  return new ComponentPickerOption("Date", {
    icon: <CalendarIcon className="size-4" />,
    keywords: ["date", "calendar", "time", "today"],
    onSelect: (_, editor) => {
      const dateTime = new Date();
      dateTime.setHours(0, 0, 0, 0); // Set time to midnight
      editor.dispatchCommand(INSERT_DATETIME_COMMAND, { dateTime });
    },
  });
}
