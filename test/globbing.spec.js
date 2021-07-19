import findFiles from "../src/finders";

test("should select all markdown files from current directory", async () => {
  const files = await findFiles(
    "**/*.md",
    "/Users/kundb/project/vayu/test/fixtures/default_content"
  );
  expect(files.length).toBe(2);
});
