/* eslint-disable no-use-before-define */

exports.seed = function seed(knex) {
  return knex("public.Color")
    .del()
    .then(() => knex("public.Color").insert(getData()));
};

function getData() {
  return [
    {
      id: 1,
      name: "red",
    },
    {
      id: 2,
      name: "green",
    },
  ];
}
