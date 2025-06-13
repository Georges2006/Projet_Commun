import serial
import sys
import time


port = 'COM3'
baud_rate = 9600
timeout = 2 

try:
    # Appel auto
    with serial.Serial(port, baud_rate, timeout=timeout) as ser:
        time.sleep(1)
        
        line = ser.readline()
        if line:
            #Suppr espaces
            data = line.decode('utf-8').strip()
            print(data) 
        else:
            print("Erreur: Aucune donnée lue sur le port série.")
            

except serial.SerialException as e:
    print(f"Erreur Serie: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Erreur Inconnue: {e}", file=sys.stderr)
    sys.exit(1)