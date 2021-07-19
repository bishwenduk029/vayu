import renderJSX from "./jsx";

function RenderPipeline() {
  const stack = [];

  const push = (...engines) => {
    stack.push(...engines);
  };

  const execute = async (layoutFile, props) => {
    let prevIndex = -1;

    const runner = async (index) => {
      if (index === prevIndex) {
        throw new Error("next() called multiple times");
      }
      prevIndex = index;
      const engine = stack[index];
      if (engine) {
        const view = await engine(layoutFile, props, () => {
          return runner(index + 1);
        });
        return view;
      }
    };

    const view = await runner(0);
    return view;
  };

  return { push, execute };
}

const buildRenderPipeline = () => {
  const pipeline = RenderPipeline();
  pipeline.push(renderJSX);
  return pipeline;
};

export default buildRenderPipeline;
