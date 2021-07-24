import React from "react";

const HTML = (props) => {
  return (
    <html lang="en" {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* General tags */}
        <title>{props.title}</title>
        <meta name="description" content={props.description} />
        <meta name="image" content={props.image} />
        <link
          rel="stylesheet"
          href="https://unpkg.com/sakura.css/css/sakura.css"
          type="text/css"
        />
      </head>
      <body {...props.bodyAttributes}>
        <noscript>This site runs best with JavaScript enabled.</noscript>
        <div key="body" id="___vayu">
          {props.children}
        </div>
      </body>
    </html>
  );
};

export default HTML;
