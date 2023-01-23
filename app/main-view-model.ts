import { BiometricIDAvailableResult, FingerprintAuth } from "nativescript-fingerprint-auth";
import { Observable } from "tns-core-modules/data/observable";
import { alert } from "tns-core-modules/ui/dialogs";

export class HelloWorldModel extends Observable {
  private fingerprintAuth: FingerprintAuth;
  public status: string = "Pritisnite gumb";
  private static CONFIGURED_PASSWORD = "MyPassword";

  constructor() {
    super();
    this.fingerprintAuth = new FingerprintAuth();
  }

  public doCheckAvailable(): void {
    this.fingerprintAuth
      .available()
      .then((result: BiometricIDAvailableResult) => {
        console.log("doCheckAvailable result: " + JSON.stringify(result));
        this.set(
          "status",
          "Biometric ID available? - " +
            (result.any ? (result.face ? "Face" : "Touch") : "NO")
        );
      })
      .catch(err => {
        console.log("doCheckAvailable error: " + err);
        this.set("status", "Error: " + err);
      });
  }

  public doCheckFingerprintsChanged(): void {
    this.fingerprintAuth
      .didFingerprintDatabaseChange()
      .then((changed: boolean) => {
        this.set(
          "status",
          "Je li biometrijski ID promijenjen? - " + (changed ? "YES" : "NO")
        );
      });
  }

  public doVerifyFingerprint(): void {
    this.fingerprintAuth
      .verifyFingerprint({
        title: "Upišite lozinku",
        message: "Skenirajte prst", 
        authenticationValidityDuration: 10 
      })
      .then(() => this.set("status", "Biometric ID / passcode OK"))
      .catch(err => {
        alert({
          title: "Biometric ID NOT OK / canceled",
          message: JSON.stringify(err),
          okButtonText: "Okay"
        });
      });
  }

  public doVerifyFingerprintWithCustomUI(): void {
    this.fingerprintAuth
      .verifyFingerprint({
        message: "Skenirajte prst", 
        useCustomAndroidUI: true 
      })
      .then((enteredPassword?: string) => {
        if (enteredPassword === undefined) {
          this.set("status", "Biometric ID OK");
        } else {
          if (enteredPassword === HelloWorldModel.CONFIGURED_PASSWORD) {
            this.set("status", "Biometric ID OK, using password");
          } else {
            this.set(
              "status",
              `Wrong password. Try '${HelloWorldModel.CONFIGURED_PASSWORD}' 😉`
            );
          }
        }
      })
      .catch(err =>
        this.set("status", `Biometric ID NOT OK: " + ${JSON.stringify(err)}`)
      );
  }

  public doVerifyFingerprintWithCustomFallback(): void {
    this.fingerprintAuth
      .verifyFingerprintWithCustomFallback({
        message: "Skenirajte prst", 
        fallbackMessage: "Unesite PIN", 
        authenticationValidityDuration: 10 
      })
      .then(() => this.set("status", "Biometric ID OK"))
      .catch(error => {
        this.set("status", "Biometric ID NOT OK: " + JSON.stringify(error));
        alert({
          title: "Biometric ID NOT OK",
          message: error.code === -3 ? "Show custom fallback" : error.message,
          okButtonText: "Okay"
        });
      });
  }
}
