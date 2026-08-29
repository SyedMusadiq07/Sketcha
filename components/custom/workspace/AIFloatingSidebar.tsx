import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor,
  Network,
  PencilRuler,
  Smartphone,
  Sparkles,
  Workflow,
  X,
  WandSparkles,
  Loader,
  Loader2Icon,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import axios from "axios";

const getSafeText = (text: any): string => {
  if (typeof text === "string") return text;
  if (typeof text === "number") return String(text);
  if (text && typeof text === "object" && text.text) return String(text.text);
  return "";
};

const AiTools = [
  {
    name: "Generate Diagrams",
    desc: "Create visual diagrams",
    icon: PencilRuler,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeBorder: "border-blue-500",
    activeBg: "bg-blue-50/70",
    prompt: `
You are an expert visual diagram generation agent for a premium whiteboard app.
Generate a clear, professional, and VISUALLY RICH diagram from the user's idea.

ELEMENT TYPES TO USE:
- "rectangle" for main concept boxes, groups, and containers
- "ellipse" for start/end nodes or circular concepts
- "diamond" ONLY for decision nodes
- "text" ONLY for standalone titles (transparent bg)
- connections for relationships between elements

STRICT VISUAL RULES (MANDATORY):
- roughness: ALWAYS 0 (never 1 or 2)
- fillStyle: ALWAYS "solid"
- Every rectangle/ellipse/diamond MUST have a vivid backgroundColor (not white, not transparent)
- strokeColor: "#ffffff" on dark shapes, dark color on light shapes
- strokeWidth: 2 for main nodes, 1.5 for containers
- roundness: 8 for regular nodes, 20 for pill/rounded nodes, 0 for sharp containers
- opacity: 90-100 for nodes, 20-30 for group container backgrounds
- fontSize: 14 for labels, 24 for title text elements

COLOR SCHEME — pick one and stay consistent:
  Option A (Indigo/Violet): nodes #4f46e5, #7c3aed, #a855f7, containers #ede9fe (opacity 20)
  Option B (Teal/Emerald): nodes #0d9488, #059669, #10b981, containers #d1fae5 (opacity 20)
  Option C (Amber/Orange): nodes #d97706, #ea580c, #f97316, containers #fef3c7 (opacity 20)
  Use white #ffffff for all node label text.

LAYOUT:
- Start at x:60, y:80. Minimum 70px gap between sibling nodes.
- Minimum node size: 180px wide, 65px tall.
- Group related nodes inside a large low-opacity container rectangle.
- Max 20 elements total.
- One standalone text title element at the top (type:"text", y:20, fontSize:26).

OUTPUT: Pure JSON only. No markdown. No explanation.
`,
  },
  {
    name: "Flowchart",
    desc: "Visualize workflows",
    icon: Workflow,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    activeBorder: "border-violet-500",
    activeBg: "bg-violet-50/70",
    prompt: `
You are an expert flowchart designer. Generate a clean, professional, color-coded flowchart.

NODE TYPE RULES:
- Start node: type "ellipse", backgroundColor "#0d9488" (teal), strokeColor "#ffffff", label "Start", width:120, height:60, roundness:30
- End node: type "ellipse", backgroundColor "#0d9488" (teal), strokeColor "#ffffff", label "End", width:120, height:60, roundness:30
- Process/Action: type "rectangle", backgroundColor "#4f46e5" (indigo), strokeColor "#ffffff", width:200, height:65, roundness:8
- Decision: type "diamond", backgroundColor "#d97706" (amber), strokeColor "#ffffff", width:160, height:100
- Sub-process: type "rectangle", backgroundColor "#0284c7" (blue), strokeColor "#ffffff", width:200, height:65, roundness:4

STRICT RULES:
- roughness: 0, fillStyle: "solid" — ALWAYS
- All nodes have white strokeColor and white label text
- strokeWidth: 2 for all nodes
- Label text max 4 words

CONNECTIONS:
- strokeColor "#64748b", strokeWidth: 2, endArrowhead: "arrow"
- Label Yes/No branches on decision connections

LAYOUT:
- Flow strictly TOP to BOTTOM. x starts at 400 for the main path.
- Start node at y:60. Each next node: y += 130.
- Yes branch: offset x+260. No branch: offset x-260, same y.
- One title text element at top-center (type:"text", fontSize:26, x:200, y:10).
- Max 18 elements total.

OUTPUT: Pure JSON only. No markdown. No explanation.
`,
  },
  {
    name: "Architecture",
    desc: "Design system architecture",
    icon: Network,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    activeBorder: "border-orange-500",
    activeBg: "bg-orange-50/70",
    prompt: `
You are a senior software architect generating a beautiful, professional system architecture diagram.

SECTION CONTAINERS (draw these FIRST as low-opacity rectangles):
- Create 3-4 large section containers, left-to-right layout
- Each section: opacity 20, fillStyle "solid", roughness 0, strokeWidth 2, roundness 4
  Client Layer (x:40): backgroundColor "#dbeafe", strokeColor "#2563eb", width:260, height:700
  Backend Layer (x:340): backgroundColor "#ede9fe", strokeColor "#7c3aed", width:260, height:700
  Data Layer (x:640): backgroundColor "#d1fae5", strokeColor "#059669", width:260, height:700
  External (x:940): backgroundColor "#fef3c7", strokeColor "#d97706", width:260, height:700
- Add a label text element at top of each container for the section name (fontSize:14, no bg)

SERVICE BOX RULES:
- type: "rectangle", roughness: 0, fillStyle: "solid", roundness: 6, strokeWidth: 0
- Client boxes: backgroundColor "#1d4ed8", strokeColor "#ffffff", width:200, height:60
- Backend boxes: backgroundColor "#6d28d9", strokeColor "#ffffff", width:200, height:60
- Data boxes: backgroundColor "#065f46", strokeColor "#ffffff", width:200, height:60
- External boxes: backgroundColor "#92400e", strokeColor "#ffffff", width:200, height:60
- All box label text: white, fontSize:13, textAlign:"center"
- Position boxes starting at y:100 inside each column, spaced 90px apart

CONNECTIONS:
- strokeColor "#94a3b8", strokeWidth: 1.5, endArrowhead: "arrow"
- Label with protocol: "REST", "SQL", "JWT", "WebSocket", etc.

OUTPUT: Pure JSON only. No markdown. No explanation.
`,
  },
  {
    name: "Web Mockup",
    desc: "Generate web wireframes",
    icon: Monitor,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    activeBorder: "border-cyan-500",
    activeBg: "bg-cyan-50/70",
    prompt: `
You are a UI/UX designer generating a detailed desktop web app wireframe using Excalidraw shapes.
Your output must look like a REAL app screen, not an architecture diagram.

MANDATORY PAGE STRUCTURE — build this layout exactly:

1. BROWSER CHROME (outermost frame):
   - type "rectangle", id "browser-frame", x:40, y:40, width:1360, height:860
   - backgroundColor "#f1f5f9", strokeColor "#cbd5e1", strokeWidth:1.5, roughness:0, roundness:8, opacity:100

2. TOPBAR / NAVBAR (inside frame, top):
   - type "rectangle", id "navbar", x:40, y:40, width:1360, height:60
   - Use the app's primary color (e.g. #4f46e5 for SaaS, #0f172a for dark apps)
   - strokeWidth:0, roughness:0, opacity:100
   - Add 2-3 small "button" rectangles inside the navbar (width:90, height:32, roundness:6)
   - Add a logo text element on the left of navbar

3. SIDEBAR (if applicable — left column):
   - type "rectangle", id "sidebar", x:40, y:100, width:220, height:800
   - backgroundColor slightly darker than main bg (e.g. #1e293b for dark, #f8fafc for light)
   - Add 4-6 nav item rectangles inside: width:180, height:40, x:50, spaced 50px apart, rounded
   - Nav items: muted color with slightly lighter active item

4. MAIN CONTENT AREA:
   x: 260 (after sidebar), y:100, width:1140, height:800
   backgroundColor: main bg color (e.g. #f8fafc or #0f172a)

   a. PAGE TITLE: type "text", fontSize:22, x:280, y:120
   b. STAT CARDS ROW (3-4 cards side by side):
      - type "rectangle", width:240, height:90, y:160, spaced 20px apart
      - backgroundColor: white or surface color, roundness:10, subtle strokeColor
      - Add a small number text and label text inside each card
   c. MAIN PANEL / TABLE / LIST:
      - Large rectangle y:280, width:1100, height:400, roundness:10
      - White/surface bg, subtle border
      - Inside: 4-5 row rectangles (height:50, full width, alternating very slightly different bg)
      - Column header row at top: slightly darker bg rectangle
   d. ACTION BUTTON:
      - type "rectangle", width:130, height:40, roundness:8
      - Primary accent color, white label "+ Add New" or similar

STRICT RULES:
- roughness: 0, fillStyle: "solid" — ALWAYS on every element
- Colors must be realistic app colors (dark mode or light mode, pick one and stay consistent)
- All text elements that are labels inside shapes should use the "label" field
- Standalone text uses type "text" with transparent bg and strokeColor
- Max 25 elements. Focus on QUALITY of a realistic app screen.

OUTPUT: Pure JSON only. No markdown. No explanation.
`,
  },
  {
    name: "Mobile Mockup",
    desc: "Generate app wireframes",
    icon: Smartphone,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    activeBorder: "border-pink-500",
    activeBg: "bg-pink-50/70",
    prompt: `
You are a mobile UI/UX designer generating a detailed mobile app wireframe using Excalidraw shapes.
Your output must look like a REAL mobile app screen.

MANDATORY PHONE STRUCTURE:

1. PHONE FRAME:
   - type "rectangle", id "phone-frame", x:40, y:40, width:390, height:844
   - backgroundColor "#1e293b", strokeColor "#475569", strokeWidth:3, roughness:0, roundness:40, opacity:100

2. SCREEN AREA (inside phone):
   - type "rectangle", id "screen", x:52, y:72, width:366, height:760
   - Use the app's bg color (e.g. #0f172a dark or #f8fafc light)
   - strokeWidth:0, roughness:0, roundness:8

3. STATUS BAR:
   - type "rectangle", x:52, y:72, width:366, height:40
   - backgroundColor: app primary color (e.g. #4f46e5)
   - strokeWidth:0, roughness:0

4. TOP APP BAR:
   - type "rectangle", x:52, y:112, width:366, height:56
   - Surface color slightly lighter than bg
   - Add a title text element centered inside
   - Add a small icon button rectangle on right

5. CONTENT AREA (x:52, y:168, width:366):
   a. SEARCH BAR (if applicable): rectangle, height:44, roundness:22, light bg, full width
   b. CARD LIST / FEED:
      - 3-4 cards stacked vertically, each: width:340, height:90, roundness:12
      - Cards: surface color, slightly different from screen bg, subtle strokeColor
      - Inside each card: a small image placeholder (rectangle, 60x60, left side) and 2 text lines
   c. FLOATING ACTION BUTTON:
      - type "ellipse", x:290, y:760+, width:56, height:56
      - Primary color, white "+" label

6. BOTTOM NAVIGATION:
   - type "rectangle", x:52, y:772, width:366, height:60
   - Surface color, subtle top border
   - 4-5 small tab rectangles inside (width:60, height:40, centered, roundness:8)
   - Active tab: primary color, others: muted

If showing multiple screens: duplicate structure, offset by x:460 each time. Max 2 screens.

STRICT RULES:
- roughness: 0, fillStyle: "solid" — ALWAYS
- Realistic app colors throughout
- Max 25 elements total

OUTPUT: Pure JSON only. No markdown. No explanation.
`,
  },
];

const AI_PLACEHOLDER_IDS = {
  container: "ai-placeholder-container",
  title: "ai-placeholder-title",
  subtitle: "ai-placeholder-subtitle",
  skeleton1: "ai-placeholder-skeleton-1",
  skeleton2: "ai-placeholder-skeleton-2",
  skeleton3: "ai-placeholder-skeleton-3"
}

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
};

const AIFloatingSidebar = ({ excalidrawApi }: Props) => {
  const [selectedTool, setSelectedTool] = useState("Generate Diagrams");
  const [prompt, setPrompt] = useState("");
  const AI_PLACEHOLDER_ID = "ai-generation-placeholder";
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const getEmptyCanvasPosition = () => {
    if (!excalidrawApi) {
      return { x: 100, y: 100 };
    }

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element) => !element.isDeleted);

    if (elements.length == 0) {
      return { x: 100, y: 100 };
    }

    // find rightmost element
    const maxRight = Math.max(...elements.map((el) => el.x + el.width));
    const minTop = Math.min(...elements.map((el) => el.y));

    return {
      x: maxRight + 150,
      y: minTop,
    };
  };

  const selectedToolData = AiTools.find((tool) => tool.name === selectedTool);

  // const handleGenerate = () => {
  //   if (!prompt.trim()) return;

  //   console.log({
  //     tool: selectedTool,
  //     systemPrompt: selectedToolData?.prompt,
  //     userPrompt: prompt,
  //   });

  //   // Your AI generation logic here
  // };

  const addAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const position = getEmptyCanvasPosition();

    const placeholderElements = convertToExcalidrawElements([
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.container,
        x: position.x,
        y: position.y,
        width: 420,
        height: 250,
        backgroundColor: "#f5f3ff",
        strokeColor: "#8b5cf6",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "text",
        x: position.x + 28,
        y: position.y + 28,
        id: AI_PLACEHOLDER_IDS.title,
        text: "✨ Generating with AI",
        fontSize: 22,
        strokeColor: "#6d28d9",
      },

      {
        type: "text",
        x: position.x + 28,
        y: position.y + 65,
        id: AI_PLACEHOLDER_IDS.subtitle,
        text: "Preparing your diagram...",
        fontSize: 15,
        strokeColor: "#6b7280",
      },
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.skeleton1,
        x: position.x + 28,
        y: position.y + 125,

        width: 190,
        height: 18,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",

        roughness: 0,

        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",

        x: position.x + 28,
        y: position.y + 155,

        width: 300,
        height: 18,
        id: AI_PLACEHOLDER_IDS.skeleton2,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",

        roughness: 0,

        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",

        x: position.x + 28,
        y: position.y + 185,
        id: AI_PLACEHOLDER_IDS.skeleton3,

        width: 190,
        height: 18,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",

        roughness: 0,

        roundness: {
          type: 3,
        },
      },
    ]);

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...placeholderElements],
    });
  };

  const onClickGenerate = async() => {

    addAiPlaceholder();
    setLoading(true);
    const currentAiTool = AiTools.find((tool) => tool.name === selectedTool);

    const result = await axios.post("/api/ai", {
      userPrompt,
      type: currentAiTool?.name,
      systemPrompt: currentAiTool?.prompt,
    });

    console.log(result.data);

    removeAiPlaceholder();

    if (result.data?.success && result.data?.diagramResult) {
      renderAIDiagram(result.data.diagramResult);
    }

    setLoading(false);
  };

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;
    const placeholderIds = Object.values(AI_PLACEHOLDER_IDS);
    const elements = excalidrawApi.getSceneElements();
    const updatedElements = elements.filter(element => !placeholderIds.includes(element.id));
      excalidrawApi.updateScene({
      elements: updatedElements,
    })
  };


const getConnectionPoints = (
    fromNode: any,
    toNode: any,
    origin: {
        x: number;
        y: number;
    }
) => {
    const fromX =
        origin.x + Number(fromNode.x || 0);

    const fromY =
        origin.y + Number(fromNode.y || 0);

    const fromWidth =
        Number(fromNode.width || 200);

    const fromHeight =
        Number(fromNode.height || 80);


    const toX =
        origin.x + Number(toNode.x || 0);

    const toY =
        origin.y + Number(toNode.y || 0);

    const toWidth =
        Number(toNode.width || 200);

    const toHeight =
        Number(toNode.height || 80);


    const fromCenterX =
        fromX + fromWidth / 2;

    const fromCenterY =
        fromY + fromHeight / 2;

    const toCenterX =
        toX + toWidth / 2;

    const toCenterY =
        toY + toHeight / 2;


    const dx =
        toCenterX - fromCenterX;

    const dy =
        toCenterY - fromCenterY;


    // --------------------------------
    // Vertical connection
    // --------------------------------

    if (Math.abs(dy) >= Math.abs(dx)) {

        // Target below source
        if (dy > 0) {
            return {
                startX: fromCenterX,
                startY: fromY + fromHeight,

                endX: toCenterX,
                endY: toY
            };
        }

        // Target above source
        return {
            startX: fromCenterX,
            startY: fromY,

            endX: toCenterX,
            endY: toY + toHeight
        };
    }


    // --------------------------------
    // Horizontal connection
    // --------------------------------

    // Target right
    if (dx > 0) {
        return {
            startX: fromX + fromWidth,
            startY: fromCenterY,

            endX: toX,
            endY: toCenterY
        };
    }


    // Target left
    return {
        startX: fromX,
        startY: fromCenterY,

        endX: toX + toWidth,
        endY: toCenterY
    };
};



const renderAIDiagram = (
    diagram: any
) => {

    if (!excalidrawApi) {
        return;
    }


    // ----------------------------------------
    // DIAGRAM ORIGIN
    // ----------------------------------------

    const origin =
        getEmptyCanvasPosition();


    const aiElements =
        diagram?.elements || [];

    const connections =
        diagram?.connections || [];


    if (!aiElements.length) {
        return;
    }


    // ----------------------------------------
    // HELPER - FIND AI NODE
    // ----------------------------------------

    const getNode = (
        id: string
    ) => {

        return aiElements.find(
            (element: any) =>
                element.id === id
        );
    };


    // ----------------------------------------
    // CREATE SHAPES
    // ----------------------------------------

    const shapeElements =
        aiElements.flatMap(
            (element: any) => {

                if (
                    !element?.type ||
                    !element?.id
                ) {
                    return [];
                }


                const x =
                    origin.x +
                    (Number(element.x) || 0);

                const y =
                    origin.y +
                    (Number(element.y) || 0);


                const width =
                    Number(element.width) || 200;

                const height =
                    Number(element.height) || 80;


                const baseElement = {

                    // VERY IMPORTANT
                    id: element.id,

                    type:
                        element.type,

                    x,
                    y,

                    width,
                    height,

                    strokeColor:
                        element.strokeColor ||
                        "#1e1e1e",

                    backgroundColor:
                        element.backgroundColor ||
                        "transparent",

                    strokeWidth:
                        Number(
                            element.strokeWidth
                        ) || 2,

                    strokeStyle:
                        element.strokeStyle ||
                        "solid",

                    fillStyle:
                        element.fillStyle ||
                        "solid",

                    // 0 = clean/polished, 1-2 = hand-drawn
                    roughness:
                        element.roughness ?? 0,

                    opacity:
                        element.opacity ?? 100,

                    ...(element.roundness != null && {
                        roundness: {
                            type: 3,
                            value: Number(element.roundness)
                        }
                    })
                };


                // --------------------------------
                // TEXT ELEMENT
                // --------------------------------

                if (
                    element.type === "text"
                ) {

                    return [
                        {
                            ...baseElement,

                            text:
                                getSafeText(
                                    element.text ||
                                    element.label
                                ),

                            fontSize:
                                Number(
                                    element.fontSize
                                ) || 18
                        }
                    ];
                }


                // --------------------------------
                // SHAPE LABEL
                // --------------------------------

                const labelText =
                    getSafeText(

                        typeof element.label ===
                            "object" &&
                            element.label !== null

                            ? element.label.text

                            : element.label ??
                            element.text
                    );


                return [
                    {
                        ...baseElement,

                        ...(labelText && {

                            label: {

                                text:
                                    labelText,

                                fontSize:
                                    Number(
                                        element.fontSize
                                    ) || 18
                            }

                        })
                    }
                ];
            }
        );


    // ----------------------------------------
    // CREATE CONNECTIONS
    // ----------------------------------------

    const connectionElements =
        connections
            .map(
                (
                    connection: any,
                    index: number
                ) => {

                    const fromNode =
                        getNode(
                            connection.from
                        );

                    const toNode =
                        getNode(
                            connection.to
                        );


                    if (
                        !fromNode ||
                        !toNode
                    ) {

                        console.warn(
                            "Unable to create connection",
                            connection
                        );

                        return null;
                    }


                    const {
                        startX,
                        startY,
                        endX,
                        endY
                    } =
                        getConnectionPoints(
                            fromNode,
                            toNode,
                            origin
                        );


                    return {

                        id:
                            connection.id ||
                            `connection-${index}`,

                        type:
                            "arrow",


                        // ------------------------
                        // Physical arrow position
                        // ------------------------

                        x:
                            startX,

                        y:
                            startY,

                        width:
                            endX -
                            startX,

                        height:
                            endY -
                            startY,


                        // ------------------------
                        // Excalidraw binding
                        // ------------------------

                        start: {
                            id:
                                connection.from
                        },

                        end: {
                            id:
                                connection.to
                        },


                        // ------------------------
                        // Styling
                        // ------------------------

                        strokeColor:
                            connection.strokeColor ||
                            "#1e1e1e",

                        strokeWidth:
                            Number(
                                connection.strokeWidth
                            ) || 2,

                        strokeStyle:
                            connection.strokeStyle ||
                            "solid",

                        roughness:
                            connection.roughness ?? 1,

                        opacity:
                            connection.opacity ?? 100,

                        startArrowhead:
                            null,

                        endArrowhead:
                            connection.endArrowhead ||
                            "arrow",


                        // ------------------------
                        // Connection label
                        // ------------------------

                        ...(connection.label && {

                            label: {

                                text:
                                    getSafeText(
                                        connection.label
                                    ),

                                fontSize:
                                    Number(
                                        connection.fontSize
                                    ) || 16
                            }

                        })
                    };
                }
            )
            .filter(Boolean);


    // ----------------------------------------
    // IMPORTANT:
    // CONVERT SHAPES + CONNECTIONS TOGETHER
    // ----------------------------------------

    const elementsToConvert = [

        ...shapeElements,

        ...connectionElements

    ];


    const newElements =
        convertToExcalidrawElements(
            elementsToConvert as any,
            {
                // VERY IMPORTANT
                regenerateIds: false
            }
        );


    // ----------------------------------------
    // EXISTING ELEMENTS
    // ----------------------------------------

    const currentElements = excalidrawApi.getSceneElements();


    // ----------------------------------------
    // UPDATE SCENE — APPEND (preserve existing work)
    // ----------------------------------------

    excalidrawApi.updateScene({
        elements: [...currentElements, ...newElements]
    });


    // ----------------------------------------
    // Scroll generated diagram into view
    // ----------------------------------------

    setTimeout(() => {
        excalidrawApi.scrollToContent(
            newElements,
            {
                fitToViewport: true,
                viewportZoomFactor: 0.85
            }
        );
    }, 100);
};



  return (
    <div className="absolute right-6 bottom-6 z-50 w-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold tracking-tight text-gray-900">
                AI Assistant
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Turn your ideas into visuals instantly
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="px-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Choose a creation mode
          </p>

          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
            {AiTools.length} tools
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AiTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.name;

            return (
              <button
                key={tool.name}
                type="button"
                onClick={() => setSelectedTool(tool.name)}
                className={`
                  group relative flex items-center gap-3 rounded-xl border p-3 text-left
                  transition-all duration-200
                  ${
                    isSelected
                      ? `${tool.activeBorder} ${tool.activeBg} shadow-sm`
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                <div
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                    ${tool.bgColor} ${tool.color}
                    transition-transform duration-200
                    group-hover:scale-105
                  `}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {tool.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {tool.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Area */}
      <div className="px-5 pb-5 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">
            What would you like to create?
          </label>

          <span className="text-xs text-gray-400">
            {prompt.length} characters
          </span>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setUserPrompt(e.target.value);
          }}
          placeholder="Describe your idea in detail..."
          className="min-h-[110px] resize-none rounded-xl border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed placeholder:text-gray-400 focus-visible:border-violet-500 focus-visible:bg-white focus-visible:ring-violet-500"
        />

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Example: Customer onboarding flow with approval decisions
          </p>
        </div>

        <Button
          onClick={onClickGenerate}
          disabled={loading}
          className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          <WandSparkles className="mr-2 h-4 w-4" />
          {loading ? <Loader2Icon className="animate-spin"/> : "Generate with AI"}
        </Button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center border-t border-gray-100 bg-gray-50 px-5 py-2.5">
        <p className="text-[11px] text-gray-400">
          AI-generated visuals can be edited after creation
        </p>
      </div>
    </div>
  );
};

export default AIFloatingSidebar;
