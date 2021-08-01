import React from "react";

const HTML = (props) => {
  return (
    <html lang="en" {...props.htmlAttributes} hidden>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* General tags */}
        <title>{props.seo?.title}</title>
        <meta name="description" content={props.seo?.description} />
        <meta name="image" content={props.seo?.image} />
        <script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@tailwindcss/typography@0.2.x/dist/typography.min.css"
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
