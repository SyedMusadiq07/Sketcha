"use client"

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'

export const Provider = ({children}: {children: React.ReactNode}) => {

    const [userDetail, setUserDetail] = useState<any>()

    const { user } = useUser();

    useEffect(() => {
        if(user) {
            CreateNewUser()
        }
    }, [user])

    const CreateNewUser  = async() => {
        try {
            const result = await axios.post('/api/users')
            console.log(result.data)
            setUserDetail(result.data)
        } catch (error) {
            console.error("Failed to create user:", error)
        }
    }
    return (
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
            <div>{children}</div>
        </UserDetailContext.Provider>
    )
} 

export default Provider
