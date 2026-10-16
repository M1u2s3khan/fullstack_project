import React from 'react'
import Home from '../Home'
import { StoreProvider } from '../context/StoreContext'

const App = () => {
  return (
    <StoreProvider>
      <Home />
    </StoreProvider>
  )
}

export default App
