"use client";
import React, { useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import {
  ArrowRight,
  Circle,
  Delete,
  Diamond,
  Eraser,
  Hand,
  icons,
  Image,
  Minus,
  MousePointer,
  MousePointer2,
  Pencil,
  Square,
  Timer,
  Type,
} from "lucide-react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import { Button } from "@/components/ui/button";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import FloatingProperties from "./FloatingProperties";
import { vector } from "drizzle-orm/pg-core";

const tools = [
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-600",
  },
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-600",
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-600",
  },
  {
    name: "diamond",
    icon: Diamond,
    color: "text-emerald-500",
  },
  {
    name: "ellipse",
    icon: Circle,
    color: "text-amber-500",
  },
  {
    name: "arrow",
    icon: ArrowRight,
    color: "text-violet-500",
  },
  {
    name: "line",
    icon: Minus,
    color: "text-pink-500",
  },
  {
    name: "freedraw",
    icon: Pencil,
    color: "text-orange-500",
  },
  {
    name: "text",
    icon: Type,
    color: "text-indigo-500",
  },
  {
    name: "image",
    icon: Image,
    color: "text-green-500",
  },
  {
    name: "eraser",
    icon: Eraser,
    color: "text-red-500",
  },
];

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const params = useParams();

  const projectId = params.projectid;
  // console.log("DEBUG: useParams() returned:", params, "projectId:", projectId);

  const [activeTool, setActiveTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>(null);

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    //cancel previous timer
    setCanvasState(appState);

    //find selected elements
    const selectedIds = Object.keys(appState.selectedElementIds || {});

    if (selectedIds?.length == 1) {
      const element = elements.find((ele) => ele.id == selectedIds[0]);
      setSelectedElement(element);
    } else {
      setSelectedElement(null);
    }

    if (saveTimeRef?.current) {
      clearTimeout(saveTimeRef.current);
    }

    // start new 10sec Timer
    saveTimeRef.current = setTimeout(() => {
      //save method
      // saveCanvasChanges(elements, appState, files);
      // toast.add({
      //     title: 'changes saved',
      //     type: 'success'
      // })
    }, 10000);
  };

  const saveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    // Excalidraw's onChange can suffer from stale closures, so we get the ID directly from the URL
    const currentProjectId = window.location.pathname.split("/").pop();
    console.log("DEBUG FRONTEND: sending to API:", {
      elements,
      files,
      appState,
      projectId: currentProjectId,
    });
    try {
      const result = await axios.post("/api/whiteboard", {
        elements,
        files,
        appState,
        projectId: currentProjectId,
      });
      console.log("DEBUG FRONTEND: API success:", result.data);
    } catch (err) {
      console.error("DEBUG FRONTEND: API error:", err);
    }
  };

  const changeTool = (tool: any) => {
    if (!excalidrawAPI) return;
    setActiveTool(tool);
    excalidrawAPI.setActiveTool({
      type: tool,
    });
  };

  // console.log(selectedElement);
  const getFloatingPosition = () => {
    if (!selectedElement || !canvasState) return { left: 0, top: 0 };

    const zoom = canvasState.zoom?.value ?? 1;

    const scrollX = canvasState.scrollX ?? 0;

    const scrollY = canvasState.scrollY ?? 0;

    // Center of selected element
    const centerX = selectedElement.x + selectedElement.width / 2;

    // Convert Excalidraw coordinates
    // into browser coordinates
    const screenX = (centerX + scrollX) * zoom;

    const screenY = (selectedElement.y + scrollY) * zoom;

    return {
      left: screenX,
      top: screenY - 60,
    };
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!excalidrawAPI || !selectedElement) return;

    const element = excalidrawAPI.getSceneElements();
    const updatedElement = element.map((element) => {
      if (element.id != selectedElement.id) {
        return element;
      }

      return {
        ...element,
        [property]: value,
        version: element.version + 1,
        updated: Date.now(),
      };
    });

    excalidrawAPI.updateScene({
      elements: updatedElement,
    });
  };

  const handleDeleteElement = () => {
    if (!excalidrawAPI || !selectedElement) return;

    // Filter the element out entirely — setting isDeleted is a readonly op
    // and won't work via spread. Filtering removes it cleanly.
    const elements = excalidrawAPI.getSceneElements();
    const updatedElements = elements.filter(
      (element) => element.id !== selectedElement.id,
    );

    excalidrawAPI.updateScene({
      elements: updatedElements,
    });

    setSelectedElement(null);
  };

  const handleOnDuplicate = () => {
    if (!excalidrawAPI || !selectedElement) return;

    const element = excalidrawAPI.getSceneElements();
    const duplicateElement = {
      ...selectedElement,
      id: crypto.randomUUID(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      seed: Math.floor(Math.random() * 1000),
      version: 1,
      updated: Date.now(),
      isDeleted: false,
    };

    excalidrawAPI.updateScene({
      elements: [...element, duplicateElement],
    });
  };

  const handleBringFrontBack = (type: string) => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();
    const selected = elements.find(
      (element) => element.id === selectedElement.id,
    );

    if (!selected) return;
    const remainingElements = elements.filter(
      (element) => element.id !== selectedElement.id,
    );

    if (type === "front") {
      excalidrawAPI.updateScene({
        elements: [...remainingElements, selected],
      });
    } else {
      excalidrawAPI.updateScene({
        elements: [selected, ...remainingElements],
      });
    }
  };

  const handleOnLock = () => {
    if (!excalidrawAPI || !selectedElement) return;

    // Toggle lock — Excalidraw honours the `locked` flag natively,
    // preventing the user from moving, resizing or editing the element.
    handlePropertyChange("locked", !(selectedElement.locked ?? false));
  };

  const floatingPosition = getFloatingPosition();
  console.log(floatingPosition);
  return (
    <div style={{ height: "90vh", width: "100vw" }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api as any)}
        onChange={handleCanvasChange}
      />

      <div
        className="absolute left-4 top-1/2 z-50 -translate-y-1/2
        flex flex-col gap-1
        rounded-2xl bg-white border p-1.5 shadow-xl"
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/10 hover:cursor-pointer ${activeTool === tool.name ? "bg-primary/10" : null}`}
              onClick={() => changeTool(tool.name)}
              key={tool.name}
            >
              <Icon size="19" className={tool.color} />
            </button>
          );
        })}
      </div>

      <FloatingProperties
        selectedElement={selectedElement}
        position={floatingPosition}
        onPropertyChange={(property, value) =>
          handlePropertyChange(property, value)
        }
        onDelete={handleDeleteElement}
        onDuplicate={handleOnDuplicate}
        onBringToFront={() => handleBringFrontBack("front")}
        onSendToBack={() => handleBringFrontBack("back")}
        onLock={() => handleOnLock()}
      />
    </div>
  );
};

export default Whiteboard;
