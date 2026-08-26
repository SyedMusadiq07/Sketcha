"use client"
import React, { useRef, useState } from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"
import { Timer } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/toast';
const Whiteboard = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const saveTimeRef =useRef<any>(null)
    const params = useParams();

    const projectId = params.projectid;
    console.log("DEBUG: useParams() returned:", params, "projectId:", projectId);

    const handleCanvasChange = (elements: readonly any[],  appState:any, files: any) => {
        //cancel previous timer 
        if(saveTimeRef?.current) {
            clearTimeout(saveTimeRef.current)
        }

        // start new 10sec Timer
        saveTimeRef.current = setTimeout(() => {
            //save method
            saveCanvasChanges(elements, appState, files);
            toast.add({
                title: 'changes saved',
                type: 'success'
            })
        }, 10000);


    }

    const saveCanvasChanges = async (elements: readonly any[],  appState:any, files: any) => {
        // Excalidraw's onChange can suffer from stale closures, so we get the ID directly from the URL
        const currentProjectId = window.location.pathname.split('/').pop();
        console.log("DEBUG FRONTEND: sending to API:", { elements, files, appState, projectId: currentProjectId });
        try {
            const result = await axios.post('/api/whiteboard', {
                elements,
                files,
                appState,
                projectId : currentProjectId,
            });
            console.log("DEBUG FRONTEND: API success:", result.data);
        } catch (err) {
            console.error("DEBUG FRONTEND: API error:", err);
        }
    }
  return (
    <div style={{ height: "93vh", width: "100vw" }}>
        <Excalidraw 
        excalidrawAPI={(api) => setExcalidrawAPI(api as any)}
        onChange={handleCanvasChange}/>
    </div>
  )
}

export default Whiteboard