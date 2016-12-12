#version 410
/*
 * 3D Perlin noise (simplex), in a GLSL fragment shader.
 *
 * Simplex noise is implemented by the functions:
 * float snoise(vec3 P)
 *
 * Author: Stefan Gustavson ITN-LiTH (stegu@itn.liu.se) 2004-12-05
 * Simplex indexing functions by Bill Licea-Kane, ATI
 */

/*
This code was irrevocably released into the public domain
by its original author, Stefan Gustavson, in January 2011.
Please feel free to use it for whatever you want.
Credit is appreciated where appropriate, and I also
appreciate being told where this code finds any use,
but you may do as you like. Alternatively, if you want
to have a familiar OSI-approved license, you may use
This code under the terms of the MIT license:

Copyright (C) 2004 by Stefan Gustavson. All rights reserved.
This code is licensed to you under the terms of the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


/*
 * "permTexture" is a 256x256 texture that is used for both the permutations
 * and the 2D and 3D gradient lookup. For details, see the main C program.
 * "gradTexture" is a 256x256 texture with 4D gradients, similar to
 * "permTexture" but with the permutation index in the alpha component
 * replaced by the w component of the 4D gradient.
 * 3D simplex noise uses only permTexture.
 */
uniform sampler2D permTexture;
uniform float radius; // object size.

/*
 * Both 2D and 3D texture coordinates are defined, for testing purposes.
 */
in vec3 vertPos;
in vec4 vertColor;

uniform float lightIntensity;
uniform float shininess;
uniform sampler2D colorTexture;

uniform bool perlin;
uniform bool marble;
uniform bool jade;
uniform bool wood;
uniform bool pwood;
uniform bool pbm;
uniform bool pwoodS;

uniform bool pnoise;
uniform bool bpnoise;

uniform float eta;

uniform float k;
uniform float per;
uniform float lac;
uniform int oct;


in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec2 textCoords;

out vec4 fragColor;

/*
 * To create offsets of one texel and one half texel in the
 * texture lookup, we need to know the texture image size.
 */
#define ONE 0.00390625
#define ONEHALF 0.001953125
// The numbers above are 1/256 and 0.5/256, change accordingly
// if you change the code to use another perm/grad texture size.


/*
 * The 5th degree smooth interpolation function for Perlin "improved noise".
 */
float fade(const in float t)
{
    // return t*t*(3.0-2.0*t); // Old fade, yields discontinuous second derivative
    return t*t*t*(t*(t*6.0-15.0)+10.0); // Improved fade, yields C2-continuous noise
}

/*
 * Efficient simplex indexing functions by Bill Licea-Kane, ATI. Thanks!
 * (This was originally implemented as a texture lookup. Nice to avoid that.)
 */
void simplex( const in vec3 P, out vec3 offset1, out vec3 offset2 )
{
    vec3 offset0;

    vec2 isX = step( P.yz, P.xx );         // P.x >= P.y ? 1.0 : 0.0;  P.x >= P.z ? 1.0 : 0.0;
    offset0.x  = dot( isX, vec2( 1.0 ) );  // Accumulate all P.x >= other channels in offset.x
    offset0.yz = 1.0 - isX;                // Accumulate all P.x <  other channels in offset.yz

    float isY = step( P.z, P.y );          // P.y >= P.z ? 1.0 : 0.0;
    offset0.y += isY;                      // Accumulate P.y >= P.z in offset.y
    offset0.z += 1.0 - isY;                // Accumulate P.y <  P.z in offset.z

    // offset0 now contains the unique values 0,1,2 in each channel
    // 2 for the channel greater than other channels
    // 1 for the channel that is less than one but greater than another
    // 0 for the channel less than other channels
    // Equality ties are broken in favor of first x, then y
    // (z always loses ties)

    offset2 = clamp(   offset0, 0.0, 1.0 );
    // offset2 contains 1 in each channel that was 1 or 2
    offset1 = clamp( --offset0, 0.0, 1.0 );
    // offset1 contains 1 in the single channel that was 1
}

void simplex( const in vec4 P, out vec4 offset1, out vec4 offset2, out vec4 offset3 )
{
    vec4 offset0;

    vec3 isX = step( P.yzw, P.xxx );        // See comments in 3D simplex function
    offset0.x = dot( isX, vec3( 1.0 ) );
    offset0.yzw = 1.0 - isX;

    vec2 isY = step( P.zw, P.yy );
    offset0.y += dot( isY, vec2( 1.0 ) );
    offset0.zw += 1.0 - isY;

    float isZ = step( P.w, P.z );
    offset0.z += isZ;
    offset0.w += 1.0 - isZ;

    // offset0 now contains the unique values 0,1,2,3 in each channel

    offset3 = clamp(   offset0, 0.0, 1.0 );
    offset2 = clamp( --offset0, 0.0, 1.0 );
    offset1 = clamp( --offset0, 0.0, 1.0 );
}



/*
 * 3D simplex noise. Comparable in speed to classic noise, better looking.
 */
float snoise(const in vec3 P)
{

// The skewing and unskewing factors are much simpler for the 3D case
#define F3 0.333333333333
#define G3 0.166666666667

    // Skew the (x,y,z) space to determine which cell of 6 simplices we're in
    float s = (P.x + P.y + P.z) * F3; // Factor for 3D skewing
    vec3 Pi = floor(P + s);
    float t = (Pi.x + Pi.y + Pi.z) * G3;
    vec3 P0 = Pi - t; // Unskew the cell origin back to (x,y,z) space
    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup

    vec3 Pf0 = P - P0;  // The x,y distances from the cell origin

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // To find out which of the six possible tetrahedra we're in, we need to
    // determine the magnitude ordering of x, y and z components of Pf0.
    vec3 o1;
    vec3 o2;
    simplex(Pf0, o1, o2);

    // Noise contribution from simplex origin
    float perm0 = texture(permTexture, Pi.xy).a;
    vec3  grad0 = texture(permTexture, vec2(perm0, Pi.z)).rgb * 4.0 - 1.0;
    float t0 = 0.6 - dot(Pf0, Pf0);
    float n0;
    if (t0 < 0.0) n0 = 0.0;
    else
    {
        t0 *= t0;
        n0 = t0 * t0 * dot(grad0, Pf0);
    }

    // Noise contribution from second corner
    vec3 Pf1 = Pf0 - o1 + G3;
    float perm1 = texture(permTexture, Pi.xy + o1.xy*ONE).a;
    vec3  grad1 = texture(permTexture, vec2(perm1, Pi.z + o1.z*ONE)).rgb * 4.0 - 1.0;
    float t1 = 0.6 - dot(Pf1, Pf1);
    float n1;
    if (t1 < 0.0) n1 = 0.0;
    else
    {
        t1 *= t1;
        n1 = t1 * t1 * dot(grad1, Pf1);
    }

    // Noise contribution from third corner
    vec3 Pf2 = Pf0 - o2 + 2.0 * G3;
    float perm2 = texture(permTexture, Pi.xy + o2.xy*ONE).a;
    vec3  grad2 = texture(permTexture, vec2(perm2, Pi.z + o2.z*ONE)).rgb * 4.0 - 1.0;
    float t2 = 0.6 - dot(Pf2, Pf2);
    float n2;
    if (t2 < 0.0) n2 = 0.0;
    else
    {
        t2 *= t2;
        n2 = t2 * t2 * dot(grad2, Pf2);
    }

    // Noise contribution from last corner
    vec3 Pf3 = Pf0 - vec3(1.0-3.0*G3);
    float perm3 = texture(permTexture, Pi.xy + vec2(ONE, ONE)).a;
    vec3  grad3 = texture(permTexture, vec2(perm3, Pi.z + ONE)).rgb * 4.0 - 1.0;
    float t3 = 0.6 - dot(Pf3, Pf3);
    float n3;
    if(t3 < 0.0) n3 = 0.0;
    else
    {
        t3 *= t3;
        n3 = t3 * t3 * dot(grad3, Pf3);
    }

    // Sum up and scale the result to cover the range [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3);
}

vec3 perlinNoise(in vec3 v)
{
    vec3 val = vec3(0.0);
    vec3 amplitude = vec3(1);
    int octaves = 6;
    float lacunarity = 2.0;
    float persistence = 0.55;
    v *= 8.0;
    for (int n = 0; n < octaves ; n++)
    {
        val += snoise(v) * amplitude;
        v *= lacunarity;
        amplitude *= persistence;
    }
    return val;
}

vec4 Jade(in float c)
{
    vec4 Color;


    float tab[5] = {0.0, 0.3, 0.6, 0.8, 1.0};
    vec4 colors[5] = {vec4( 24.0, 166.0, 102.0, 255.0), vec4( 78.0, 174.0, 115.0, 255.0),
                      vec4(128.0, 224.0, 165.0, 255.0), vec4( 78.0, 154.0, 115.0, 255.0), vec4( 29.0, 155.0, 102.0, 255.0)
                     };

    int j = 1;
    while ((c > tab[j]) && (j < 4))
    {
        j = j+1;
    }

    if (c == tab[j])
    {
        Color = colors[j];
    }
    else
    {
        Color = colors[j-1] + (colors[j] - colors[j-1]) * (c - tab[j-1]) / (tab[j] - tab[j-1]);

    }


    Color = Color - vec4(20.0, 20.0, 20.0, 0.0);
    return Color / 255.0;

}

vec4 Wood(in float c)
{
    vec4 Color;


    float tab[3] = {0.0,  0.75,  1.0};
    vec4 colors[3] = {vec4(189, 94, 4, 255.0),   vec4(144, 48, 6, 255  ), vec4( 60, 10, 8, 255  )};

    int j = 1;
    while ((c > tab[j]) && (j < 2))
    {
        j = j+1;
    }

    if (c == tab[j])
    {
        Color = colors[j];
    }
    else
    {
        Color = colors[j-1] + (colors[j] - colors[j-1]) * (c - tab[j-1]) / (tab[j] - tab[j-1]);

    }


    Color = Color - vec4(20.0, 20.0, 20.0, 0.0);
    return Color / 255.0;

}




void main( void )
{

    vec4 Color = vertColor;
    float c;
    vec4 Ca, Cs, Cd;

    /* Calcul de la distance à la droite (B, u) pour la texture de bois  */
    vec3 B = vec3(1.0,-2.0,10.0);
    vec3 u = vec3(1.0,1.0,-1.0);
    vec3 pBu = cross(u, B - vertPos.xyz)/sqrt(u.x * u.x + u.y*u.y + u.z*u.z);
    float d = sqrt(pBu.x * pBu.x + pBu.y*pBu.y + pBu.z*pBu.z);


    fragColor = vec4(0.5 + 0.5 * perlinNoise(vertPos.xyz/(20*radius)), 1.0);
    vec4 V = normalize(eyeVector);
    vec4 L = normalize(lightVector);
    vec3 Ni  = normalize(vertNormal);
    vec4 N = vec4(Ni, 0.0);
    vec4 R;
    bool carrelage = false;
    //ambient
if(carrelage){
        float x,y,z;
        x = vertPos.x;
        y = vertPos.y;
        z = vertPos.z;

       /* float theta = atan(y/x);
        float phi = acos(z/sqrt(x*x + y*y + z*z));
        float s = 1.0;
        float d = ( 3+ sin(20*x) + sin(20.0*y) + sin(20*z)  )* (1.0/6.0);
        d = floor(10.0*d) / 10.0;
        fragColor = vec4(d,d,d,1);*/
        fragColor = vec4(0.0,0.0,0.0,0.0);
}

    // Marble : http://physbam.stanford.edu/cs448x/old/Procedural_Noise%282f29Perlin_Noise.html

    if(marble)
    {
        c = 0.5 + 0.5* sin(100*(vertPos.x + vertPos.y+vertPos.z)/(pow(k,5)*radius) +  100*fragColor.x);
        Color  = vec4( 0.3 + 0.6*c, 0.3 + 0.8 * c *c, 0.6 + 0.4*c, 1.0);
    }

    if (jade)  //Jade
    {


        c = perlinNoise(vertPos.xyz/(k*radius)).x;
        Color = Jade(c);
    }

    if (wood)
    {
        // calcul de la distance à la droite définie par le point B(0,0,0) et le vecteur directeur u(1,0,0)
        d = (0.5 + 0.5 *cos(3*pow(k,3.0)*d )) ;
        Color = Wood(d);
    }
    if (pwood || pwoodS)
    {

        d = (0.5 + 0.5 *cos(3*pow(k,3.0)*d + perlinNoise(vertPos.xyz/(radius)).x)) ;
        Color = Wood(d);

    }
    if (pbm)
    {
        // D'après ceci : https://digitalerr0r.wordpress.com/2011/05/18/xna-shader-programming-tutorial-26-bump-mapping-perlin-noise/
        float eps = 0.001;

        float F0  =  vec4(0.5 + 0.5 * perlinNoise(vertPos.xyz/(k*radius)), 1.0).x;
        float Fx  =  vec4(0.5 + 0.5 * perlinNoise((vertPos.xyz+vec3(eps, 0.0,0.0))/(k*radius)), 1.0).x;
        float Fy  =  vec4(0.5 + 0.5 * perlinNoise((vertPos.xyz+vec3(0.0, eps,0.0))/(k*radius)), 1.0).x;
        float Fz  =  vec4(0.5 + 0.5 * perlinNoise((vertPos.xyz+vec3(0.0, 0.0, eps))/(k*radius)), 1.0).x;
        vec4 DF = vec4(Fx - F0, Fy - F0, Fz - F0, 0.0) / eps;
        vec4 Nm = normalize(N - DF);
        N = Nm;
        /*Ca = lightIntensity * Color;
        Cd =  lightIntensity * Color * max(dot(Nm, L),0.0);
        R = 2*( dot(L, Nm) * Nm )- L;
        Cs = lightIntensity *  pow(max( dot(R, V), 0.0), shininess) *  Color ;
        fragColor = 0.2* Ca + 0.3*Cd + 0.5*Cs; */

    }
  /* Calcul de Ca, cD et Cs*/
     Ca = lightIntensity * Color;
     Cd = lightIntensity * Color * max(dot(N, L),0.0);
     vec4 H = normalize(V + L);
     float NdotH = max(dot(N, H), 0.0);

     R = 2*( dot(L, N) * N )- L;
     R = normalize(R);

        if (pnoise) {
            Cs = lightIntensity *  pow(max( dot(R, V), 0.0), shininess) *  Color ;
        }
        else if (bpnoise){

            Cs = lightIntensity *  pow(max(NdotH, 0.0), 4*shininess) *   Color ;
        }
        else {
            float F0 = pow((1-eta)/(1+eta), 2.0);
            float F = F0 + (1-F0) * pow((1 - dot(H,V)), 5.0);
            Cs = F * lightIntensity *  pow(max(NdotH, 0.0), 4*shininess) *   Color ;
        }

    if (pwoodS) {
        Cs = Cs * (1 - perlinNoise(vertPos.xyz/(radius)).x);
    }







    if (!perlin) {
        fragColor = 0.2* Ca + 0.3*Cd + 0.5*Cs;
    }
    else
    {
        Color =  vec4(0.5 + 0.5 * perlinNoise(vertPos.xyz/(k*radius)), 1.0);
    }








}
