import { Header } from "../Components/Header";
import './NotFound.css'

export function NotFound({cart}){
    return (
        <>
        <Header cart={cart}/>
       <div className="error-screen-wrapper">
    <div className="error-box">
      <p className="error-title">Error</p>
      <h1 className="error-code">404</h1>
      <p className="error-message">Not Found</p>
    </div>
  </div>
  </>
    );
}