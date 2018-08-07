/* eslint-disable no-use-before-define */

exports.seed = function seed(knex) {
  return Promise.all([
    knex.raw("ALTER TABLE ?? ENABLE TRIGGER ALL;", ["public.Color"]),
    knex.raw("ALTER TABLE ?? ENABLE TRIGGER ALL;", ["public.Letter"]),
    knex.raw("ALTER TABLE ?? ENABLE TRIGGER ALL;", ["public.ZEmpty"]),
  ]);
};
