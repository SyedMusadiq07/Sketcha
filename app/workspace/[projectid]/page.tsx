"use client"
import SmartDoc from '@/components/custom/workspace/SmartDoc';
import dynamic from 'next/dynamic';
const Whiteboard = dynamic(() => import('@/components/custom/workspace/Whiteboard'), { ssr: false });
import WorkspaceHeader from '@/components/custom/workspace/WorkspaceHeader'
import React, { useState } from 'react'

const Workspace = () => {
  const [activeTab, setActiveTab] = useState('whiteboard');
  return (
    <>
    <WorkspaceHeader selectedTab={(value: string) => setActiveTab(value)}/>
      {activeTab == 'whiteboard' ? <Whiteboard /> : <SmartDoc />}

    </>
  )
}

export default Workspace