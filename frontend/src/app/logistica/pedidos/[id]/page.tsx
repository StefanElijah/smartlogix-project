'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { pedidosApi, enviosApi } from '@/lib/api';
import { PedidoResponse, Envio } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { EstadoPedidoBadge } from '@/components/ui/EstadoPedidoBadge';
import { EstadoEnvioBadge } from '@/components/ui/EstadoEnvioBadge';
import Spinner from '@/components/shared/Spinner';

export default function DetallePedidoLogisticaPage() {
    const { id } = useParams();
    const router = useRouter();
    const [pedido, setPedido] = useState<PedidoResponse | null>(null);
    const [envio, setEnvio] = useState<Envio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            pedidosApi.obtener(Number(id)),
            enviosApi.obtenerPorPedidoId(Number(id)).catch(() => null)
        ])
            .then(([pedidoData, envioData]) => {
                setPedido(pedidoData);
                setEnvio(envioData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;
    if (!pedido) return <div>Pedido no encontrado</div>;

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push('/logistica/pedidos')}
            >
                ← Volver a pedidos
            </Button>

            <h1 className="text-2xl font-bold mb-6">
                Detalle del Pedido #{pedido.numeroOrden}
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Información del pedido */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>
                            <strong>Número de orden:</strong> {pedido.numeroOrden}
                        </p>
                        <p>
                            <strong>Estado:</strong>{' '}
                            <EstadoPedidoBadge estado={pedido.estado} />
                        </p>
                        <p>
                            <strong>Fecha del pedido:</strong>{' '}
                            {pedido.fechaPedido
                                ? new Date(pedido.fechaPedido).toLocaleString()
                                : 'No disponible'}
                        </p>
                        <p>
                            <strong>Total:</strong> ${pedido.totalCompra.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Información del envío (si existe) */}
                {envio && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del envío</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Número de tracking:</strong> {envio.numeroTracking}</p>
                            <p><strong>Estado envío:</strong> <EstadoEnvioBadge estado={envio.estadoEnvio} /></p>
                            <p><strong>Destinatario:</strong> {envio.destinatario}</p>
                            <p><strong>Dirección:</strong> {envio.calle} {envio.numero}, {envio.comuna}, {envio.ciudad}</p>
                            <p><strong>Método de envío:</strong> {envio.metodoEnvio}</p>
                            <p><strong>Empresa logística:</strong> {envio.empresaLogistica}</p>
                            <p><strong>Fecha estimada:</strong> {envio.fechaEstimadaEntrega}</p>
                            <p><strong>Fecha creación:</strong> {envio.fechaCreacion ? new Date(envio.fechaCreacion).toLocaleString() : 'No disponible'}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Tabla de productos */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Precio unitario</TableHead>
                                <TableHead>Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pedido.detalles?.map((det) => (
                                <TableRow key={det.id}>
                                    <TableCell>{det.nombreProducto}</TableCell>
                                    <TableCell>{det.sku}</TableCell>
                                    <TableCell>{det.cantidad}</TableCell>
                                    <TableCell>${det.precioUnitario.toLocaleString()}</TableCell>
                                    <TableCell>${det.subtotal.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}