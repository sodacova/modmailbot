exports.up = async (knex) => {
  await knex.schema.table("thread_messages", (table) => {
    table.string("thread_message_id", 20).nullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.table("thread_messages", (table) => {
    table.dropUnique("thread_message_id");
  });
};