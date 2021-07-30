import { compile } from "../index";

const FIXTURES_ROOT_FOLDER =
  "/Users/kundb/project/vayu/src/transformers/md/__tests__/fixtures";

test("should parse partials together into a single object graph", async () => {
  const frontMatter = await compile(`${FIXTURES_ROOT_FOLDER}/test.md`, null, {
    contentFolder: FIXTURES_ROOT_FOLDER,
  });
  expect(frontMatter).toMatchSnapshot();
});

test("should throw an error if the partial is not having any key", async () => {
  try {
    await compile(`${FIXTURES_ROOT_FOLDER}/errorContent.md`, null, {
      contentFolder: FIXTURES_ROOT_FOLDER,
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("should throw an error if the partial does not exist", async () => {
  try {
    await compile(`${FIXTURES_ROOT_FOLDER}/missingPartialContent.md`, null, {
      contentFolder: FIXTURES_ROOT_FOLDER,
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("should parse aggregations correctly", async () => {
  const frontMatter = await compile(
    `${FIXTURES_ROOT_FOLDER}/test_aggr.md`,
    null,
    {
      contentFolder: FIXTURES_ROOT_FOLDER,
    }
  );
  expect(frontMatter).toMatchSnapshot();
});

test("should parse simple markdowns without collections correctly", async () => {
  const frontMatter = await compile(
    `${FIXTURES_ROOT_FOLDER}/test_simple.md`,
    null,
    {
      contentFolder: FIXTURES_ROOT_FOLDER,
    }
  );
  expect(frontMatter).toMatchSnapshot();
});
