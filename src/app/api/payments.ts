import { BlackCatOrderDataType } from "../types/BlackCat";
import { OrderDataType } from "../types/Datas";
import { HyperCashOrderResponseDataType, HyperCashOrderResponseType } from "../types/HyperCash";
import { createNocoOrder } from "./db/createNocoOrder";
import formatNocoOrderBlackCatData from "./formatData/formatNocoOrderBlackCatData";
import formatNocoOrderHyperCashData from "./formatData/formatNocoOrderHyperCashData";

import formatOrderHyperCashData from "./formatData/formatOrderHyperCashData";
import 'server-only'

export async function createBlackCatOrderd(orderData: OrderDataType) {
  // Cartão de crédito - Em breve
  // Apenas PIX está disponível no momento
  
  try {
        const publicKey = process.env.BLACKCAT_PUBLIC_KEY || 'PUBLIC_KEY';
        const secretKey = process.env.BLACKCAT_SECRET_KEY || 'SECRET_KEY';
        const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');
        const productsId = orderData.items.map(item => ({
            Id: Number(item.externalRef)
        }))

        // Criar transação na Black Cat
        const blackCatResponse = await fetch('https://api.blackcatpagamentos.com/v1/transactions', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: auth || ''
            },
            body: JSON.stringify(orderData),
        });

        if (!blackCatResponse.ok) {
            throw new Error(`Black Cat API error: ${blackCatResponse.status}`);
        }

        const blackCatData: BlackCatOrderDataType = await blackCatResponse.json();
        // [redacted] remoção de logs de resposta completa da Black Cat

        // Formatar dados para NocoDB
        const nocoOrderData = formatNocoOrderBlackCatData(blackCatData);
        // [redacted] remoção de logs de dados formatados

        const customerOrderData = {
            name: blackCatData.customer.name,
            email: blackCatData.customer.email,
            phone: blackCatData.customer.phone,
            document_number: blackCatData.customer.document.number,
            document_type: blackCatData.customer.document.type,
            external_ref: blackCatData.customer.id.toString(),
        }

        // Criar ordem no NocoDB
        const nocoResult = await createNocoOrder(nocoOrderData, customerOrderData);
        // [redacted] remoção de logs de resultados completos do NocoDB

        if (!nocoResult.success) {
            throw new Error('Failed to create order in NocoDB');
        }

        return {
            success: true,
            blackCatData,
            nocoOrderId: nocoResult.orderId,
            productsId
        };

    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export async function createHyperCashOrder(orderData: OrderDataType) {
  // Cartão de crédito - Em breve
  // Apenas PIX está disponível no momento
  
  try {
        const secretKey = process.env.HYPERCASH_SECRET_KEY || 'SECRET_KEY';
        const auth = 'Basic ' + Buffer.from('x:' + secretKey).toString('base64');

        const productsId = orderData.items.map(item => ({
            Id: Number(item.externalRef)
        }))

        const hyperCashOrderData = formatOrderHyperCashData(orderData)

        // Criar transação na Hyper Cash
        const hyperCashResponse = await fetch('https://api.hypercashbrasil.com.br/api/user/transactions', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: auth || ''
            },
            body: JSON.stringify(hyperCashOrderData),
        });

        const { data }: HyperCashOrderResponseType = await hyperCashResponse.json();

        if (!hyperCashResponse.ok) {
            throw new Error(`Hyper Cash API error: ${hyperCashResponse.status}`);
        }

        const hyperCashData: HyperCashOrderResponseDataType = data;
        // [redacted] remoção de logs de resposta completa da Hyper Cash

        // Formatar dados para NocoDB
        const nocoOrderData = formatNocoOrderHyperCashData(hyperCashData);
        // [redacted] remoção de logs de dados formatados

        const customerOrderData = {
            name: hyperCashData.customer.name,
            email: hyperCashData.customer.email,
            phone: hyperCashData.customer.phone,
            document_number: hyperCashData.customer.document.number,
            document_type: hyperCashData.customer.document.type.toLowerCase(),
            external_ref: hyperCashData.customer.id.toString(),
        }

        // Criar ordem no NocoDB
        const nocoResult = await createNocoOrder(nocoOrderData, customerOrderData);
        // [redacted] remoção de logs de resultados completos do NocoDB

        if (!nocoResult.success) {
            throw new Error('Failed to create order in NocoDB');
        }

        return {
            success: true,
            hyperCashData,
            nocoOrderId: nocoResult.orderId,
            productsId
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
  }
