"use client";

import { useEffect, useRef, useState } from "react";

interface BattleVisualsProps {
    currentPlayerCard: any;
    currentEnemy: any;
    battleInProgress: boolean;
    battleTimer: number;
    currentEncounter: number;
}

interface Card {
    id: string;
    name: string;
    description: string;
    asciiArt: string;
    health: number;
    damage: number;
    type: "fire" | "water" | "earth" | "air";
}

export function BattleVisuals({
                                  currentPlayerCard,
                                  currentEnemy,
                                  battleInProgress,
                                  battleTimer,
                                  currentEncounter,
                              }: BattleVisualsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
    const [currentPlayerHP, setCurrentPlayerHP] = useState<number>(0);
    const [currentEnemyHP, setCurrentEnemyHP] = useState<number>(0);
    const [turnNumber, setTurnNumber] = useState<number>(0);
    const [hasFirstTurnPassed, setHasFirstTurnPassed] = useState<boolean>(false);

    const playerHPRef = useRef<number>(0);
    const enemyHPRef = useRef<number>(0);
    const initialBattleTimeRef = useRef<number>(0);
    const battleStartTimestampRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const lastAppliedTurnRef = useRef<number>(-1);

    const arcRandomRef = useRef<Record<number, { amp: number; freq: number; phase: number }>>({});

    useEffect(() => {
        if (currentPlayerCard) {
            setCurrentPlayerHP(currentPlayerCard.health);
            playerHPRef.current = currentPlayerCard.health;
        } else {
            setCurrentPlayerHP(0);
            playerHPRef.current = 0;
        }

        if (currentEnemy) {
            setCurrentEnemyHP(currentEnemy.health);
            enemyHPRef.current = currentEnemy.health;
        } else {
            setCurrentEnemyHP(0);
            enemyHPRef.current = 0;
        }

        setTurnNumber(0);
        setHasFirstTurnPassed(false);
        initialBattleTimeRef.current = 0;
        lastAppliedTurnRef.current = -1;
        battleStartTimestampRef.current = null;
        arcRandomRef.current = {};
    }, [currentPlayerCard, currentEnemy, currentEncounter]);

    useEffect(() => {
        if (battleInProgress && battleTimer > 0 && initialBattleTimeRef.current === 0) {
            initialBattleTimeRef.current = battleTimer;
            battleStartTimestampRef.current = performance.now();
            lastAppliedTurnRef.current = -1;
        }
        if (!battleInProgress || battleTimer === 0) {
            initialBattleTimeRef.current = 0;
            lastAppliedTurnRef.current = -1;
            battleStartTimestampRef.current = null;
        }
    }, [battleInProgress, battleTimer]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                const isMobile = width < 768;
                const isTablet = width >= 768 && width < 1024;

                let height;
                if (isMobile) {
                    height = Math.min(350, window.innerHeight * 0.45);
                } else if (isTablet) {
                    height = Math.min(450, window.innerHeight * 0.5);
                } else {
                    height = Math.min(600, window.innerHeight * 0.55);
                }

                setDimensions({ width, height });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const getCharacterPosition = (isEnemy: boolean, width: number, height: number) => {
        const isMobile = width < 768;
        if (isMobile) {
            return isEnemy ? { x: width * 0.80, y: height * 0.6 } : { x: width * 0.20, y: height * 0.4 };
        }
        return isEnemy ? { x: width * 0.92, y: height * 0.6 } : { x: width * 0.08, y: height * 0.4 };
    };

    const getProjectileGlyph = (type: Card["type"]) => {
        switch (type) {
            case "fire":
                return "*";
            case "water":
                return "~";
            case "earth":
                return "o";
            case "air":
                return "-";
            default:
                return "*";
        }
    };

    const drawImpact = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.font = "20px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.fillText("✶", x, y);
        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = dimensions.width + "px";
        canvas.style.height = dimensions.height + "px";
        canvas.width = Math.floor(dimensions.width * dpr);
        canvas.height = Math.floor(dimensions.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        let mounted = true;

        const frame = () => {
            if (!mounted) return;

            let elapsed = 0;
            if (battleStartTimestampRef.current !== null) {
                elapsed = (performance.now() - battleStartTimestampRef.current) / 1000;
            } else {
                elapsed = initialBattleTimeRef.current - battleTimer;
                if (elapsed < 0) elapsed = 0;
            }

            if (initialBattleTimeRef.current > 0 && currentPlayerCard && currentEnemy) {
                const currentTurn = Math.max(0, Math.floor(elapsed / 5));
                const phaseTime = elapsed % 5;
                const travelProgress = Math.min(1, phaseTime / 2.5);

                const impactThreshold = 0.98;

                // apply both damages once when projectiles reach near target for this turn
                if (travelProgress >= impactThreshold && currentTurn > lastAppliedTurnRef.current) {
                    // simultaneous damage (allow negative results)
                    const playerDamage = currentPlayerCard.damage ?? 0;
                    const enemyDamage = currentEnemy.damage ?? 0;

                    const prevEnemyHP = enemyHPRef.current;
                    const prevPlayerHP = playerHPRef.current;

                    const newEnemyHP = Math.max(-9999, prevEnemyHP - playerDamage); // allow negative
                    const newPlayerHP = Math.max(-9999, prevPlayerHP - enemyDamage);

                    if (newEnemyHP !== prevEnemyHP) {
                        enemyHPRef.current = newEnemyHP;
                        setCurrentEnemyHP(newEnemyHP);
                    }
                    if (newPlayerHP !== prevPlayerHP) {
                        playerHPRef.current = newPlayerHP;
                        setCurrentPlayerHP(newPlayerHP);
                    }

                    lastAppliedTurnRef.current = currentTurn;
                    setTurnNumber(currentTurn);
                    if (currentTurn > 0) setHasFirstTurnPassed(true);
                }
            }

            drawScene(ctx, dimensions.width, dimensions.height, (battleStartTimestampRef.current !== null ? (performance.now() - battleStartTimestampRef.current) / 1000 : 0));

            rafRef.current = requestAnimationFrame(frame);
        };

        if (battleInProgress && initialBattleTimeRef.current > 0) {
            rafRef.current = requestAnimationFrame(frame);
        } else {
            drawScene(ctx, dimensions.width, dimensions.height, 0);
        }

        return () => {
            mounted = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [currentPlayerCard, currentEnemy, battleInProgress, battleTimer, dimensions, currentPlayerHP, currentEnemyHP]);

    const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number, elapsedSeconds: number) => {
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgba(8,8,16,0.95)";
        ctx.fillRect(0, 0, width, height);

        if (currentPlayerCard) drawCharacter(ctx, currentPlayerCard, false, width, height, currentPlayerHP);
        if (currentEnemy) drawCharacter(ctx, currentEnemy, true, width, height, currentEnemyHP);

        if (initialBattleTimeRef.current > 0 && currentPlayerCard && currentEnemy && battleInProgress) {
            drawSimultaneousProjectiles(ctx, width, height, elapsedSeconds);
        }
    };

    // Simultaneous projectiles: sinusoidal wave path, small amplitude, randomized per turn, vanish on impact
    const drawSimultaneousProjectiles = (ctx: CanvasRenderingContext2D, width: number, height: number, elapsedSeconds: number) => {
        const globalTurn = Math.max(0, Math.floor(elapsedSeconds / 5)); // 0-based
        const phaseTime = elapsedSeconds % 5;
        const travelProgress = Math.min(1, phaseTime / 2.5); // 0..1 in first half; after 1, projectiles shouldn't be drawn

        // ensure random arc params for this turn
        if (!arcRandomRef.current[globalTurn]) {
            arcRandomRef.current[globalTurn] = {
                amp: 8 + Math.random() * 10, // small amplitude so it stays on screen
                freq: 2 + Math.random() * 2, // wave frequency
                phase: Math.random() * Math.PI * 2,
            };
        }
        const arc = arcRandomRef.current[globalTurn];

        const playerPos = getCharacterPosition(false, width, height);
        const enemyPos = getCharacterPosition(true, width, height);

        // if travelProgress is 1 or greater, projectiles have impacted and should not be drawn any longer (impact flash is drawn near 0.95..1)
        const drawProgress = travelProgress;

        // helper to compute sinus offset perpendicular to trajectory
        const computeSinOffset = (from: { x: number; y: number }, to: { x: number; y: number }, t: number, isLeftToRight: boolean) => {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.hypot(dx, dy) || 1;
            // normalized perpendicular vector
            const px = -dy / len;
            const py = dx / len;

            // sin-based offset (zero at endpoints, wave in middle)
            const sinFactor = Math.sin(t * Math.PI * arc.freq + arc.phase) * Math.sin(t * Math.PI); // zero at 0 and 1
            const sign = isLeftToRight ? 1 : -1;
            const offset = sinFactor * arc.amp * sign;

            return { ox: px * offset, oy: py * offset };
        };

        const drawOne = (from: { x: number; y: number }, to: { x: number; y: number }, type: Card["type"], leftToRight: boolean) => {
            // only draw while traveling (0..1), otherwise disappear
            if (drawProgress <= 0) return;
            if (drawProgress >= 1) {
                // draw a very short impact flash and return (projectile & trail removed)
                const color = typeColor(type);
                drawImpact(ctx, to.x, to.y - 6, color);
                return;
            }

            // easing (easeOut)
            const p = 1 - Math.pow(1 - drawProgress, 2);
            const x = from.x + (to.x - from.x) * p;
            const y = from.y + (to.y - from.y) * p;

            const off = computeSinOffset(from, to, p, leftToRight);
            const projX = x + off.ox;
            const projY = y + off.oy;

            // color & glyph
            const glyph = getProjectileGlyph(type);
            const color = typeColor(type);

            ctx.save();
            ctx.font = "18px monospace";
            ctx.textAlign = "center";

            // draw a short trail behind projectile while traveling (but vanish on impact)
            const trailCount = 3;
            for (let t = 1; t <= trailCount; t++) {
                const backP = Math.max(0, p - t * 0.06);
                const bx = from.x + (to.x - from.x) * backP;
                const by = from.y + (to.y - from.y) * backP;
                const backOff = computeSinOffset(from, to, backP, leftToRight);
                ctx.globalAlpha = Math.max(0.12, 0.9 - t * 0.28);
                ctx.fillStyle = color;
                ctx.fillText(glyph, bx + backOff.ox, by + backOff.oy);
            }

            // main projectile
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.fillText(glyph, projX, projY);

            // small impact hint when near target
            if (drawProgress >= 0.92) {
                drawImpact(ctx, to.x, to.y - 6, color);
            }

            ctx.restore();
        };

        // Draw both projectiles (player->enemy and enemy->player) with opposite leftToRight flags to vary offset direction
        drawOne(playerPos, enemyPos, currentPlayerCard.type, true);
        drawOne(enemyPos, playerPos, currentEnemy.type, false);
    };

    const typeColor = (type: Card["type"]) => {
        switch (type) {
            case "fire":
                return "rgba(255,120,60,0.95)";
            case "water":
                return "rgba(100,180,255,0.95)";
            case "earth":
                return "rgba(200,160,100,0.95)";
            case "air":
                return "rgba(220,220,255,0.95)";
            default:
                return "rgba(255,255,255,0.95)";
        }
    };

    // Character drawing (ASCII + HP)
    const drawCharacter = (ctx: CanvasRenderingContext2D, card: Card, isEnemy: boolean, width: number, height: number, currentHP: number) => {
        const pos = getCharacterPosition(isEnemy, width, height);
        drawAsciiArt(ctx, card, pos.x, pos.y, isEnemy, width, height);
        drawCharacterInfo(ctx, card, pos.x, pos.y, isEnemy, width, height, currentHP);
    };

    const drawAsciiArt = (ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, isEnemy: boolean, width: number, height: number) => {
        if (!card.asciiArt) {
            ctx.fillStyle = isEnemy ? "rgba(255,100,100,0.9)" : "rgba(100,255,100,0.9)";
            ctx.font = "14px monospace";
            ctx.textAlign = "center";
            ctx.fillText(isEnemy ? "E" : "P", x, y);
            return;
        }

        const asciiLines = card.asciiArt.split("\n").filter((l) => l.trim() !== "");
        const fontSize = Math.max(6, Math.min(14, dimensions.width / 40));
        const lineHeight = fontSize * 1.1;

        ctx.fillStyle = isEnemy ? "rgba(255,120,120,0.95)" : "rgba(150,255,150,0.95)";
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = "center";

        asciiLines.forEach((line, i) => {
            const displayLine = dimensions.width < 400 ? line.trim().substring(0, 10) : line.trim();
            const drawY = y - (asciiLines.length * lineHeight) / 2 + i * lineHeight;
            ctx.fillText(displayLine, x, drawY);
        });
    };

    const drawCharacterInfo = (ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, isEnemy: boolean, width: number, height: number, currentHP: number) => {
        const asciiLines = card.asciiArt ? card.asciiArt.split("\n").filter((l) => l.trim() !== "") : [];
        const fontSize = Math.max(8, Math.min(12, width / 45));
        const lineHeight = fontSize * 1.1;
        const artHeight = asciiLines.length * lineHeight;

        // Increased spacing for health bar to prevent cutoff
        const infoY = y + artHeight / 2 + 35; // Increased from 25 to 35

        ctx.fillStyle = isEnemy ? "rgba(255,80,80,0.95)" : "rgba(80,255,80,0.95)";
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = "center";

        const displayName = width < 400 && card.name.length > 10 ? card.name.substring(0, 10) : card.name;
        ctx.fillText(displayName, x, infoY);

        const hpBarY = infoY + 12;
        drawASCIIHPBar(ctx, card, x, hpBarY, width, currentHP);
    };

    const drawASCIIHPBar = (ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, width: number, currentHP: number) => {
        const barWidth = width < 400 ? 10 : 12;
        const maxHP = card.health || 1;

        const filledSegments = Math.max(0, Math.round(barWidth * (currentHP / maxHP)));
        const emptySegments = barWidth - filledSegments;
        const asciiBar = "[" + "█".repeat(Math.max(0, Math.min(barWidth, filledSegments))) + "░".repeat(Math.max(0, Math.min(barWidth, emptySegments))) + "]";

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        const barFontSize = width < 400 ? 8 : 10;
        ctx.font = `${barFontSize}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(asciiBar, x, y);

        ctx.fillStyle = currentHP > maxHP * 0.6 ? "rgba(200,255,200,0.9)" : currentHP > maxHP * 0.3 ? "rgba(255,255,200,0.9)" : "rgba(255,150,150,0.9)";
        ctx.font = `${barFontSize - 1}px monospace`;
        ctx.fillText(`${currentHP}/${maxHP}`, x, y + 10);
    };

    return (
        <div className="p-2 sm:p-4 flex flex-col items-center justify-center w-full">
            <div ref={containerRef} className="relative rounded-lg bg-black/80 border border-gray-700 overflow-hidden w-full" style={{ minHeight: "250px", height: "auto" }}>
                <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="block w-full h-full" />
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
                <div className="p-2 sm:p-3 rounded-lg bg-black/40 border border-green-800/50">
                    <h4 className="text-sm sm:text-base font-bold text-green-400 text-center">Játékos</h4>
                    {currentPlayerCard && (
                        <div className="text-center text-gray-200 mt-1">
                            <div className="font-bold text-sm">{currentPlayerCard.name}</div>
                            <div className="flex justify-center gap-4 text-xs mt-1">
                                <span className="text-red-400">Seb: {currentPlayerCard.damage}</span>
                                <span className="text-green-400">Életerő: {currentPlayerHP}/{currentPlayerCard.health}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-2 sm:p-3 rounded-lg bg-black/40 border border-red-800/50">
                    <h4 className="text-sm sm:text-base font-bold text-red-400 text-center">Kazamata</h4>
                    {currentEnemy && (
                        <div className="text-center text-gray-200 mt-1">
                            <div className="font-bold text-sm">{currentEnemy.name}</div>
                            <div className="flex justify-center gap-4 text-xs mt-1">
                                <span className="text-red-400">Seb: {currentEnemy.damage}</span>
                                <span className="text-green-400">Életerő: {currentEnemyHP}/{currentEnemy.health}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}