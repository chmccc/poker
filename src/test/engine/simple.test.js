test("should return true because object.string === string", () => {
  const testScoreObj = {
    owner: "mike",
  };
  expect(testScoreObj.owner).toEqual("mike");
});
