import React from "react";
import HtmlShell from "./html";

const DevPage = (props) => {
  return (
    <HtmlShell>
      <main className="max-w-5xl p-8">
        <header>Index of Directory</header>
        <ul className="grid grid-cols-4 gap-3 p-8 list-none text-sm">
          {props.files.map((file) => {
            return (
              <li key={file.name} className=" m-4">
                <a href={file} className="flex flex-row text-left">
                  <span>
                    {file.type === "folder" ? (
                      <svg
                        className="align-baseline"
                        width="20"
                        height="24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.784 3.87a1.565 1.565 0 0 0-.565-.356V2.426c0-.648-.523-1.171-1.15-1.171H8.996L7.908.25A.89.89 0 0 0 7.302 0H2.094C1.445 0 .944.523.944 1.171v2.3c-.21.085-.398.21-.565.356a1.348 1.348 0 0 0-.377 1.004l.398 9.83C.42 15.393 1.048 16 1.8 16h15.583c.753 0 1.36-.586 1.4-1.339l.398-9.83c.021-.313-.125-.69-.397-.962zM1.843 3.41V1.191c0-.146.104-.272.25-.272H7.26l1.234 1.088c.083.042.167.104.293.104h8.282c.125 0 .25.126.25.272V3.41H1.844zm15.54 11.712H1.78a.47.47 0 0 1-.481-.46l-.397-9.83c0-.147.041-.252.125-.356a.504.504 0 0 1 .377-.147H17.78c.125 0 .272.063.377.147.083.083.125.209.125.334l-.418 9.83c-.021.272-.23.482-.481.482z"
                          fill="black"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="align-baseline"
                        width="15"
                        height="19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 8C8.34 8 7 6.66 7 5V1H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V8h-4zM8 5c0 1.1.9 2 2 2h3.59L8 1.41V5zM3 0h5l7 7v9c0 1.66-1.34 3-3 3H3c-1.66 0-3-1.34-3-3V3c0-1.66 1.34-3 3-3z"
                          fill="black"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="mx-2">{file.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </main>
    </HtmlShell>
  );
};

export default DevPage;
