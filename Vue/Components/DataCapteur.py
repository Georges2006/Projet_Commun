import serial
import sys
import time

# Paramètres de connexion au port série
port = 'COM3'
baud_rate = 9600
timeout = 2 # On augmente un peu le timeout pour être sûr

try:
    # Le 'with' s'assure que ser.close() est appelé automatiquement
    with serial.Serial(port, baud_rate, timeout=timeout) as ser:
        # Petite attente pour que l'Arduino ait le temps d'envoyer quelque chose
        time.sleep(1)
        
        # Lire une ligne de données
        line = ser.readline()
        
        # Vérifier si des données ont été lues avant de les décoder
        if line:
            # Décoder en utf-8 et supprimer les espaces/sauts de ligne superflus
            data = line.decode('utf-8').strip()
            print(data) # On envoie la donnée au script PHP
        else:
            print("Erreur: Aucune donnée lue sur le port série.")
            

except serial.SerialException as e:
    # Affiche l'erreur de manière claire
    print(f"Erreur Serie: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Erreur Inconnue: {e}", file=sys.stderr)
    sys.exit(1)