import React from "react";
import HtmlShell from "./html";

const App = ({ content }) => {
  return (
    <HtmlShell>
      <main className="p-8">
        <article
          className="prose lg:prose-xl mx-auto max-w-6xl"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
    </HtmlShell>
  );
};

export default App;
