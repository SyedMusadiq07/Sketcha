"use client"
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'
import React, { useState } from 'react'

const ProjectList = () => {
  const [projectList, setProjectList] = useState([])

  return (
    <div>
      {projectList.length == 0 ? (
        <div className='flex flex-col items-center p-10 border rouned-xl mt-10 gap-3'>
          <Folder className='h-20 w-20 text-gray-500'/>
          <h2 className='text-3xl font-bold'>No Boards Found</h2>
          <p className='text-gray-600 text-md'>Create your first board to start brainstorming, Planning !</p>
          <Button>+ Create New Board</Button>
        </div>

      ): 
      (
        <div>
          
        </div>
      )
      }
    </div>
  )
}

export default ProjectList