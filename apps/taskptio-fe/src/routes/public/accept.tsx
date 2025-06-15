import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"


const AcceptRoute = () => {

    const navigate = useNavigate()

    const { token } = useParams()
    
    useEffect(() => {
        if ( !token ) {
            navigate('/login')
        }
    }, [token])

    return (
        <div>

        </div>
    )

}

export default AcceptRoute