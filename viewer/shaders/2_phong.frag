#version 410

uniform float lightIntensity;
uniform float largeurContour;
uniform sampler2D shadowMap;
uniform bool contour;
uniform bool phong;
uniform bool blinnPhong;
uniform bool cookTorrance;
uniform bool bagher;
uniform bool gooch;
uniform bool shMap;
uniform bool xtoon;
uniform bool Fresnel;

uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec4 vertColor;

in vec4 lightSpace;

out vec4 fragColor;

void main( void )
{

    float ka = 0.2;
    float kd = 0.3;
    float ks = 0.6;
    vec4 V = normalize(eyeVector);
    vec4 L = normalize(lightVector);
    vec3 Ni  = normalize(vertNormal);
    vec4 N = vec4(Ni, 0.0);
    vec4 H = normalize(V + L);
    float NdotH = max(dot(N, H), 0.0);
    float NdotV = max(dot(N,V), 0.0);
    float VdotH = max(dot(V,H), 0.0);
    float NdotL = max(dot(N,L), 0.0);
    N = normalize(N);
    vec4 R = 2*( dot(L, N) * N )- L;
    R = normalize(R);
    float RdotV = max(dot(R,V), 0.0);

    bool carrelage = true;

    vec4 Ca, Cd, Cs;
    Ca = lightIntensity * vertColor;
    Cd = lightIntensity * vertColor * NdotL;
    Cs = lightIntensity *  pow(RdotV, shininess) *  vertColor ;
    fragColor = ka * Ca + kd * Cd +ks * Cs ;



    float F0 = pow(1-eta, 2) / pow(1+eta, 2);
    float F = F0 + (1-F0) * pow(1 - dot(H, V), 5);
    if (shMap)
    {

        //Profondeur dans la shadowMap
	vec3 projCoords = lightSpace.xyz/lightSpace.w;
	projCoords = (projCoords * 0.5) + 0.5;
	float closestDepth = texture(shadowMap, projCoords.xy).x;
	float currentDepth = projCoords.z;
	float bias = 0.005;
	float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
	vec4 lighting = (ka*Ca + (1.0-shadow) * (kd*Cd + ks*Cs))*vertColor;
fragColor = lighting;



    }


    else {
    if (phong)
    {
        Ca = lightIntensity * vertColor;
        Cd = lightIntensity * vertColor * NdotL;
        Cs = lightIntensity *  pow(RdotV, shininess) *  vertColor ;
        fragColor = ka * Ca + kd * Cd +ks * Cs ;
    }

    if (blinnPhong)
    {

        Ca = lightIntensity * vertColor;
        Cd = lightIntensity * vertColor * NdotL;
        Cs = lightIntensity *  pow(max(NdotH, 0.0), 4*shininess) *   vertColor ;



        fragColor = ka * Ca + kd * Cd + ks * Cs;
    }

    if (Fresnel) {
        Ca = lightIntensity * vertColor;
        Cd = lightIntensity * vertColor * NdotL;
        Cs = lightIntensity *  pow(max(NdotH, 0.0), 4*shininess) *   vertColor ;

        Cs = F*Cs;

        fragColor = ka * Ca + kd * Cd + ks * Cs;

    }

    if (cookTorrance)
    {
        Ca = lightIntensity * vertColor;
        Cd = lightIntensity * vertColor * NdotL;
        float rhV = 0.0003;
        float k = 0.7;

        float mSquared = rhV * rhV;

        float NH2 = 2.0 * NdotH;
        float g1 = (NH2 * NdotV) / VdotH;
        float g2 = (NH2 * NdotL) / VdotH;
        float geoAtt = min(1.0, min(g1, g2));


        float r1 = 1.0 / ( 4.0 * mSquared * pow(NdotH, 4.0));
        float r2 = (NdotH * NdotH - 1.0) / (mSquared * NdotH * NdotH);
        float roughness = r1 * exp(r2);
        float specular = 0.0;
        if (NdotL > 0.0)
        {
            float specular = (F * geoAtt * roughness) / (NdotV * NdotL * 3.14159);
        }
        Cs = vertColor * lightIntensity *  NdotL * (k + specular * (1-k));
        fragColor = ka * Ca + kd * Cd + ks *Cs ;

    }
    if (gooch)
    {
        //From there : https://www.cs.utah.edu/~shirley/papers/gooch98.pdf
        vec4 kcool = vec4(236.0, 236.0, 139.0, 0.0)/255.0;
        vec4 kwarm = vec4(0.0, 0.0, 1.0, 0.0);
        vec4 kdiff = vertColor;
        float alpha = 0.25;
        float beta = 0.5;
        vec4 kcdiff = kcool + alpha * kdiff;
        vec4 kwdiff = kwarm + beta * kdiff;
        // Cs = lightIntensity *  pow(max( dot(R, V), 0.0), shininess) *  vertColor;
        fragColor = 0.5* (1+NdotL) * kcdiff + 0.5*( 1- NdotL) * kwdiff  ;



    }
    if (xtoon)
    {
        NdotL = floor(5.0*NdotL)/5.0;
        Ca = lightIntensity * vertColor;
        Cd = lightIntensity * vertColor * NdotL;
        Cs = lightIntensity *  pow(RdotV, shininess) *  vertColor ;
        fragColor = ka * Ca + kd * Cd  ;



    }

    if(contour)
    {
        float  edgeDetection = dot(V.xyz, vertNormal) > largeurContour ? 1.0 : 0.0 ;
        fragColor = edgeDetection * fragColor;

    }


}

}
