import React from "react";

const App = ({ content }) => {
  return (
    <main className="p-8">
      <article
        className="prose lg:prose-xl mx-auto max-w-6xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
};

export default App;
