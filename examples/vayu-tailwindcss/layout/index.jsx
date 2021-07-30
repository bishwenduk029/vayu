import React from "react";
import HtmlShell from "./html";

const App = ({ content, data }) => {
  return (
    <HtmlShell>
      <header className="mb-4 italic font-bolder p-5 text-3xl">
        {data.author}
      </header>
      <main className="p-8 divide-y divide-yellow-500 max-w-screen-xl mx-auto text-blue-400">
        <div className="flex flex-row">
          <div dangerouslySetInnerHTML={{ __html: data.sidecontent.content }} />
          <div>
            <h1 className="p-3 text-wrap text-8xl text-center mb-8 font-extrabold">
              {data.title}
            </h1>
            <article
              className="prose lg:prose-xl mx-auto max-w-6xl py-8 text-gray-70"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </main>
      <hr />
    </HtmlShell>
  );
};

export default App;
