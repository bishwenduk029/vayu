import { deriveLayoutFileFromContentFile } from "..";
import path from "path";

let VAYU_CONFIG = {
  contentFolder: path.resolve(
    process.cwd(),
    "src/layout/__test__/fixtures/content"
  ),
  theme: path.resolve(process.cwd(), "src/layout/__test__/fixtures/theme"),
  dest: "./public",
};

test("should find matching layout for normal content file", async () => {
  const layoutFile = await deriveLayoutFileFromContentFile(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/content/about.md"
    ),
    VAYU_CONFIG
  );
  expect(layoutFile).toBe(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/theme/about/index.jsx"
    )
  );
});

test("should find matching layout for dynamic content file", async () => {
  const layoutFile = await deriveLayoutFileFromContentFile(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/content/blogs/post1.md"
    ),
    VAYU_CONFIG
  );
  expect(layoutFile).toBe(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/theme/blogs/[post].jsx"
    )
  );
});

test("should find matching layout for a single index.md in content folder", async () => {
  const layoutFile = await deriveLayoutFileFromContentFile(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/content/index.md"
    ),
    VAYU_CONFIG
  );
  expect(layoutFile).toBe(
    path.resolve(process.cwd(), "src/layout/__test__/fixtures/theme/index.jsx")
  );
});

test("should find matching layout for a super nested dynamic content file", async () => {
  const layoutFile = await deriveLayoutFileFromContentFile(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/content/blogs/cooking/spicy/noodles/post1.md"
    ),
    VAYU_CONFIG
  );
  expect(layoutFile).toBe(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/theme/blogs/cooking/spicy/noodles/[post].jsx"
    )
  );
});

test("should find matching layout for a super nested normal content file", async () => {
  const layoutFile = await deriveLayoutFileFromContentFile(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/content/blogs/cooking/spicy/noodles/inspiration/index.md"
    ),
    VAYU_CONFIG
  );
  expect(layoutFile).toBe(
    path.resolve(
      process.cwd(),
      "src/layout/__test__/fixtures/theme/blogs/cooking/spicy/noodles/inspiration/index.jsx"
    )
  );
});
