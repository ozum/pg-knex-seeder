/* eslint-disable no-use-before-define */

exports.seed = function seed(knex) {
  return knex("public.Letter")
    .del()
    .then(() => knex("public.Letter").insert(getData()));
};

function getData() {
  return [
    {
      id: 1,
      name: "a",
    },
    {
      id: 2,
      name: "b",
    },
  ];
}
