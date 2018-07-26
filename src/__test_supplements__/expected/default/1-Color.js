/* eslint-disable no-use-before-define */

exports.seed = function seed(knex) {
  return knex("Item")
    .del()
    .then(() => knex("Item").insert(getData()));
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
