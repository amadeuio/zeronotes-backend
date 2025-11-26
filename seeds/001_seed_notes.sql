TRUNCATE notes CASCADE;

INSERT INTO notes ("order", title, content, color_id, is_pinned, is_archived, is_trashed) VALUES 
  (1, 'Welcome Note', 'This is your first note! Start writing...', 'default', false, false, false),
  (2, 'Shopping List', 'Milk, Eggs, Bread, Cheese', 'yellow', false, false, false),
  (3, 'Meeting Notes', 'Discuss project timeline and deliverables', 'blue', true, false, false),
  (4, 'Personal Reminder', 'Call mom this weekend', 'green', false, false, false),
  (5, 'Ideas for Project', 'Feature ideas: dark mode, search, filters', 'purple', false, false, false),
  (6, 'Archived Note', 'This note is archived', 'default', false, true, false),
  (7, 'Important Task', 'Complete the backend API by Friday', 'red', true, false, false)

