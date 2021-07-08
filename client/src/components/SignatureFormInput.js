import React, { Component } from "react";
import SignatureCanvas from 'react-signature-canvas';

class SignatureFormInput extends Component {

    constructor(props) {
        super(props);
        
        this.getCanvasWidth = this.getCanvasWidth.bind(this);
        this.validate = this.validate.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.removeValidationClasses = this.removeValidationClasses.bind(this);
    }

    getCanvasWidth() {
        let el = document.getElementById('empty-div');
        if (el != null) {
            return el.getBoundingClientRect().width;
        }
        return 0;
    }

    /**
     * Check if canvas is empty and attach css class to make whether it is valid or not.
     */
    validate() {
        let isValid = !this.sigCanvas.isEmpty();

        this.removeValidationClasses();
        let canvas = document.getElementById("sig-canvas");
        canvas.classList.add(isValid ? "is-valid" : "is-invalid");

        return isValid;
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        this.sigCanvas.clear();
        this.removeValidationClasses();
    }

    /**
     * Remove validation classes
     */
    removeValidationClasses() {
        let canvas = document.getElementById("sig-canvas");
        canvas.classList.remove("is-valid");
        canvas.classList.remove("is-invalid");
    }

    render() {
        return (
            <div>
                <label for="signature">Signature</label>
                <SignatureCanvas ref={(ref) => { this.sigCanvas = ref }} onEnd={this.validate}
                    canvasProps={
                        {width: this.getCanvasWidth(), 
                        height: 120, 
                        className: 'sig-canvas',
                        id: 'sig-canvas'}}/>
                <div class="invalid-feedback">
                    Sign it.
                </div>
                <button class="btn btn-link float-right" type="button" onClick={this.clearCanvas}>Clear</button>
                <div style={{clear: 'both'}}></div>
            </div>
        );
    }
}

export default SignatureFormInput;