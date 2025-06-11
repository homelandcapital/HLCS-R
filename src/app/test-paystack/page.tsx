
// src/app/test-paystack/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initializePayment, verifyPayment, type InitializePaymentInput, type InitializePaymentResponse, type VerifyPaymentResponse } from '@/actions/paystack-actions';
import { useToast } from '@/hooks/use-toast';

function TestPaystackComponent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [initResponse, setInitResponse] = useState<InitializePaymentResponse | null>(null);
  const [verifyResponse, setVerifyResponse] = useState<VerifyPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client where window is available
    setCallbackUrl(window.location.origin + '/test-paystack');
  }, []);


  const handleInitializePayment = async () => {
    setIsLoading(true);
    setInitResponse(null);
    setVerifyResponse(null);

    if (!callbackUrl) {
        toast({ title: 'Error', description: 'Callback URL not set yet. Please wait a moment.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    const paymentDetails: InitializePaymentInput = {
      email: 'test-customer@example.com', // Use a test email
      amountInKobo: 10000, // 100 NGN (Paystack minimum is usually NGN 50 or 100)
      reference: `test_tx_${Date.now()}`,
      callbackUrl: callbackUrl, // Use the dynamically set callback URL
      metadata: {
        testTransaction: true,
        description: "Testing Paystack Integration"
      }
    };

    try {
      const response = await initializePayment(paymentDetails);
      setInitResponse(response);
      if (response.success && response.data?.authorization_url) {
        toast({ title: 'Payment Initialized', description: 'Redirecting to Paystack...' });
        window.location.href = response.data.authorization_url;
      } else {
        toast({ title: 'Initialization Failed', description: response.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: `An unexpected error occurred: ${error.message}`, variant: 'destructive' });
      setInitResponse({ success: false, message: `Client-side error: ${error.message}` });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack often uses trxref as well

    const paymentReference = reference || trxref;

    if (paymentReference && !verifyResponse && !isLoading) { // Avoid re-verifying if already done or if another process is loading
      const handleVerify = async () => {
        setIsLoading(true);
        try {
          const response = await verifyPayment({ reference: paymentReference });
          setVerifyResponse(response);
          if (response.success && response.paymentSuccessful) {
            toast({ title: 'Payment Verified!', description: `Transaction ${paymentReference} was successful.` });
          } else if (response.success && !response.paymentSuccessful) {
            toast({ title: 'Payment Verification', description: `Transaction ${paymentReference} was not successful (${response.data?.status}).`, variant: 'default' });
          } else {
            toast({ title: 'Verification Failed', description: response.message, variant: 'destructive' });
          }
        } catch (error: any) {
          toast({ title: 'Error Verifying', description: `An unexpected error occurred: ${error.message}`, variant: 'destructive' });
          setVerifyResponse({ success: false, message: `Client-side error: ${error.message}` });
        }
        setIsLoading(false);
      };
      handleVerify();
    }
  }, [searchParams, toast, verifyResponse, isLoading]); // Added isLoading to dependencies

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Paystack Integration</CardTitle>
          <CardDescription>
            Use this page to test Paystack payment initialization and verification.
            Ensure your Paystack test keys are in the .env file and
            <code> PAYSTACK_CALLBACK_URL</code> is set to your current base URL + <code>/test-paystack</code> (e.g., {callbackUrl || 'http://localhost:9002/test-paystack'}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleInitializePayment} disabled={isLoading || !callbackUrl}>
            {isLoading ? 'Processing...' : 'Initialize Test Payment (100 NGN)'}
          </Button>
           {!callbackUrl && <p className="text-xs text-muted-foreground">Waiting for callback URL to be determined...</p>}

          {initResponse && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-lg">Initialization Response</CardTitle></CardHeader>
              <CardContent>
                <p>Success: {initResponse.success.toString()}</p>
                <p>Message: {initResponse.message}</p>
                {initResponse.data && (
                  <>
                    <p>Authorization URL: <a href={initResponse.data.authorization_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{initResponse.data.authorization_url}</a></p>
                    <p>Access Code: {initResponse.data.access_code}</p>
                    <p>Reference: {initResponse.data.reference}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {verifyResponse && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-lg">Verification Response</CardTitle></CardHeader>
              <CardContent>
                <p>Success (API Call): {verifyResponse.success.toString()}</p>
                <p>Message: {verifyResponse.message}</p>
                <p>Payment Successful: {verifyResponse.paymentSuccessful?.toString() ?? 'N/A'}</p>
                {verifyResponse.data && (
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(verifyResponse.data, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() needs it
export default function TestPaystackPage() {
  return (
    <Suspense fallback={<div>Loading Paystack Test Page...</div>}>
      <TestPaystackComponent />
    </Suspense>
  );
}
