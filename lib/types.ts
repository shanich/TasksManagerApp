export type ReminderDTO = {
  id: string;
  active: boolean;
  emailEnabled: boolean;
  emailTime: string | null;
  emailDaysOfWeek: string | null;
  telegramEnabled: boolean;
  telegramIntervalHours: number | null;
} | null;

export type AssigneeDTO = { id: string; name: string } | null;

export type TaskDTO = {
  id: string;
  topicId: string;
  title: string;
  notes: string | null;
  done: boolean;
  assignee: AssigneeDTO;
  reminder: ReminderDTO;
};
