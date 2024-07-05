const Notify = ({errorMessage}) => {
    return (
        <>
            {errorMessage?
                <div style={{background:"lightGray", padding:20}}>
                    {errorMessage}
                </div>
                :null
            }
        </>
    )
}

export default Notify