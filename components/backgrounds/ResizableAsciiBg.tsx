"use client";

import { useState, useEffect } from "react";

const forest = [
    ["  /\\  ", " /  \\ ", "/____\\", "  ||  "],
    ["  &&  ", " &&&& ", "  ||  "],
    ["  ||  ", "  ||  "],
];

const palm_desert = [
    [
        "//^\\\\",
        " '#' ",
        "  #  ",
        "  #  ",
        "  #  ",
        "  #  "
    ],
    [
        "    //^\\\\",
        "     '#' ",
        "    #  ",
        "  #  ",
        "  #  ",
        "  #  "
    ],
    [
        "//^\\\\",
        " '#' ",
        "    #  ",
        "      #  ",
        "      #  ",
        "      #  "
    ],
    [
        "Q_/\\/\\",
        "  ||||`"
    ]
];

const desert = [
    [
        "Q_/\\/\\",
        "  ||||`"
    ]
];

const mountains = [
    [
        "   /\\    ",
        "  /  \\   ",
        " /    \\  ",
        "/      \\ ",
    ],
    [
        "    /\\       ",
        "   /  \\      ",
        "  /    \\  /\\ ",
        " /      \\/  \\",
    ],
    [
        "  /\\      ",
        " /  \\  /\\ ",
        "/    \\/  \\",
    ],
    [
        "     /\\        ",
        "  /\\/  \\       ",
        " /      \\   /\\ ",
        "/        \\_/  \\",
    ],

    [
        "    /^^\\    ",
        "   /^^^^\\   ",
        "  /      \\  ",
        " /        \\ ",
    ],
    [
        "   /^\\      ",
        "  /^^^\\ /\\  ",
        " /     /  \\ ",
        "/     /    \\",
    ],
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
    className?: string;
    rows?: number;
    cols?: number;
    opacity?: number;
}

const DEFAULT_ROWS = 12;
const DEFAULT_COLS = 40;

const ResizableAsciiBg = ({ type, className = "", rows = DEFAULT_ROWS, cols = DEFAULT_COLS, opacity = 0.15 }: Props) => {
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

        const grid: string[][] = Array.from({ length: rows }, () =>
            Array(cols).fill(" ")
        );

        const treeCount = Math.floor(Math.random() * (rows * cols / 80)) + (rows * cols / 60);

        for (let t = 0; t < treeCount; t++) {
            const tree = trees[Math.floor(Math.random() * trees.length)];
            const maxRow = rows - tree.length;
            const maxCol = cols - tree[0].length;

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

                            if (row < rows && col < cols) {
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
    }, [type, rows, cols]);

    if (!isMounted) {
        return (
            <div
                className={className}
                style={{
                    backgroundColor: "black",
                    opacity: opacity,
                }}
            />
        );
    }

    return (
        <div
            className={className}
            style={{
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: "14px",
                color: "white",
                opacity: opacity,
                backgroundColor: "black",
                overflow: "hidden",
                whiteSpace: "pre",
                pointerEvents: "none",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
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

export default ResizableAsciiBg;