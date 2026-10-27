
import { useState } from "react";


function useForm(initialState){

    const [inputData, setInputData] = useState(initialState)

   function inputHandler(e){
    const name = e.target.name;
    const value = e.target.value;
    setInputData(prevData => ({...prevData, [name]: value}))
   }

return {inputData, setInputData, inputHandler}  

}

export default useForm