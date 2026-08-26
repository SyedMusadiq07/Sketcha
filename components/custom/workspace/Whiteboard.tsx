"use client";
import React, { useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { ArrowRight, Circle, Delete, Diamond, Eraser, Hand, icons, Image, Minus, MousePointer, MousePointer2, Pencil, Square, Timer, Type } from "lucide-react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import { Button } from "@/components/ui/button";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const tools = [
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-600",
  },
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-600"
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-600",
  },
  {
  name: "diamond",
  icon: Diamond,
  color: "text-emerald-500"
},
{
  name: "ellipse",
  icon: Circle,
  color: "text-amber-500"
},
{
  name: "arrow",
  icon: ArrowRight,
  color: "text-violet-500"
},
{
  name: "line",
  icon: Minus,
  color: "text-pink-500"
},
{
  name: "freedraw",
  icon: Pencil,
  color: "text-orange-500"
},
{
  name: "text",
  icon: Type,
  color: "text-indigo-500"
},
{
    name: "image",
    icon: Image,
    color: "text-green-500"
},
{
    name: "eraser",
    icon: Eraser,
    color: "text-red-500"
}
];

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const params = useParams();

  const projectId = params.projectid;
  console.log("DEBUG: useParams() returned:", params, "projectId:", projectId);

  const [activeTool, setActiveTool] = useState("selection");

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    //cancel previous timer
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
    if(!excalidrawAPI) return;
    setActiveTool(tool)
    excalidrawAPI.setActiveTool({
        type:tool
    })
  }

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
            <button className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/10 hover:cursor-pointer ${activeTool === tool.name ? 'bg-primary/10' : null}`} onClick={() => changeTool(tool.name)} key={tool.name}>
              <Icon size="19" className={tool.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Whiteboard;
