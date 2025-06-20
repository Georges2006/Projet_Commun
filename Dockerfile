 # Dockerfile pour SerreConnect
FROM php:8.2-apache

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Configuration et installation des extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    mysqli \
    gd \
    zip \
    mbstring \
    xml \
    curl

# Activation du module rewrite d'Apache
RUN a2enmod rewrite

# Configuration d'Apache pour PHP
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Définition du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers du projet
COPY . /var/www/html/

# Configuration des permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Exposition du port 80
EXPOSE 80

# Démarrage d'Apache
CMD ["apache2-foreground"]