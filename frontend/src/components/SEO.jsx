import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, structuredData }) => {
    return (
        <Helmet>
            { /* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            { /* End standard metadata tags */}

            { /* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            { /* End Facebook tags */}

            { /* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            { /* End Twitter tags */}

            { /* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    )
}

SEO.defaultProps = {
    title: 'QuickEats - Delicious Food Delivered',
    description: 'Order your favorite meals from the best restaurants in town.',
    name: 'QuickEats',
    type: 'website'
}

export default SEO;
