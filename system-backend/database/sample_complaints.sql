-- FOR TESTING ONLY. Not part of the real data.
-- Adds 3 pending complaints from the demo resident (juan@email.com) so the admin has something to evaluate.
-- (They have no photo. A complaint filed through the API with a photo shows the picture in the pop-up.)
-- Run it once in phpMyAdmin (SQL tab) after importing schema.sql.
USE baranggay_db;

INSERT INTO complaints (user_id, category, house, description, status) VALUES
  (5, 'Noise',                'House no. 8',  'Loud karaoke past 11 PM every night.',                 'Pending'),
  (5, 'Road or drainage',     'House no. 30', 'Clogged drainage causing flooding near the corner.',   'Pending'),
  (5, 'Garbage / sanitation', 'House no. 21', 'Uncollected garbage beside the drainage.',             'Pending');
