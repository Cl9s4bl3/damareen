"use client";

import { useState, useEffect } from "react";

const forest = [
  ["  /\\  ", " /  \\ ", "/____\\", "  ||  "],
  ["  &&  ", " &&&& ", "  ||  "],
  ["  ||  ", "  ||  "],
];

const palm_desert = [
  ["//^\\\\", " '#' ", "  #  ", "  #  ", "  #  ", "  #  "],
  ["    //^\\\\", "     '#' ", "    #  ", "  #  ", "  #  ", "  #  "],
  ["//^\\\\", " '#' ", "    #  ", "      #  ", "      #  ", "      #  "],
  ["Q_/\\/\\", "  ||||`"],
];

const desert = [["Q_/\\/\\", "  ||||`"]];

const mountains = [
  ["   /\\    ", "  /  \\   ", " /    \\  ", "/      \\ "],
  ["    /\\       ", "   /  \\      ", "  /    \\  /\\ ", " /      \\/  \\"],
  ["  /\\      ", " /  \\  /\\ ", "/    \\/  \\"],
  [
    "     /\\        ",
    "  /\\/  \\       ",
    " /      \\   /\\ ",
    "/        \\_/  \\",
  ],

  ["    /^^\\    ", "   /^^^^\\   ", "  /      \\  ", " /        \\ "],
  ["   /^\\      ", "  /^^^\\ /\\  ", " /     /  \\ ", "/     /    \\"],
  [
    "    /^^\\       ",
    "   /^^^^\\   /\\ ",
    "  /      \\_/  \\",
    " /            \\",
  ],
  [
    "   /^\\       ",
    "  /^^^\\__     ",
    " /       \\  /\\",
    "/         \\/  \\",
  ],
];

interface Props {
  type: string;
}

const ROWS = 100;
const COLS = 500;

const AsciiBg = ({ type }: Props) => {
  const [displayedPattern, setDisplayedPattern] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const trees =
      type === "forest"
        ? forest
        : type === "palm_desert"
          ? palm_desert
          : type === "desert"
            ? desert
            : type === "mountains"
              ? mountains
              : forest;

    const grid: string[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(" "),
    );

    const treeCount = Math.floor(Math.random() * 40) + 120;

    for (let t = 0; t < treeCount; t++) {
      const tree = trees[Math.floor(Math.random() * trees.length)];
      const maxRow = ROWS - tree.length;
      const maxCol = COLS - tree[0].length;

      if (maxRow > 0 && maxCol > 0) {
        const r = Math.floor(Math.random() * maxRow);
        const c = Math.floor(Math.random() * maxCol);

        let canPlace = true;
        for (let i = 0; i < tree.length; i++) {
          for (let j = 0; j < tree[i].length; j++) {
            if (grid[r + i][c + j] !== " " && tree[i][j] !== " ") {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (canPlace) {
          for (let i = 0; i < tree.length; i++) {
            for (let j = 0; j < tree[i].length; j++) {
              const row = r + i;
              const col = c + j;

              if (row < ROWS && col < COLS) {
                if (tree[i][j] !== " " || grid[row][col] === " ") {
                  grid[row][col] = tree[i][j];
                }
              }
            }
          }
        }
      }
    }

    setDisplayedPattern(grid.map((row) => row.join("")));
  }, [type]);

  if (!isMounted) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          zIndex: -1,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: "16px",
        color: "white",
        opacity: 0.2,
        backgroundColor: "black",
        overflow: "hidden",
        zIndex: -1,
        whiteSpace: "pre",
        pointerEvents: "none",
      }}
    >
      {displayedPattern.map((row, i) => (
        <div key={i} style={{ margin: 0, padding: 0 }}>
          {row}
        </div>
      ))}
    </div>
  );
};

export default AsciiBg;
